import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply data migration

actor {
  // ENUMS AND TYPES

  type Gender = {
    #male;
    #female;
    #other;
  };

  type DatingPreferences = {
    preferredGenders : [Gender];
    minAge : Nat8;
    maxAge : Nat8;
    minDistance : Nat;
    maxDistance : Nat;
  };

  type DatingProfile = {
    firstName : Text;
    lastName : Text;
    location : Text;
    age : Nat8;
    gender : Gender;
    profilePicUrl : Text;
    images : [Text];
    datingPreferences : DatingPreferences;
    bioSections : [Text];
    personalityTraits : [Text];
    hobbies : [Text];
    interests : [Text];
    socialMedia : [Text];
    links : [Text];
    languages : [Text];
    isVisible : Bool;
    hasVideoChatEnabled : Bool;
  };

  type Match = {
    user1 : Principal;
    user2 : Principal;
    timestamp : Int;
  };

  type Message = {
    sender : Principal;
    content : Text;
    timestamp : Int;
  };

  let profileStore = Map.empty<Principal, DatingProfile>();
  let matchStore = Map.empty<Nat, Match>();
  let chatStore = Map.empty<Nat, [Message]>();
  let likes = Map.empty<Principal, [Principal]>();
  let rejections = Map.empty<Principal, [Principal]>();

  // Authentication
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // PROFILE MANAGEMENT

  public shared ({ caller }) func createProfile(profile : DatingProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    if (profileStore.containsKey(caller)) {
      Runtime.trap("Cannot create new profile: Profile already exists for this principal!");
    };

    profileStore.add(caller, profile);
  };

  public shared ({ caller }) func updateProfile(profile : DatingProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    if (not (profileStore.containsKey(caller))) {
      Runtime.trap("Cannot update profile: Profile does not exist!");
    };

    profileStore.add(caller, profile);
  };

  public shared ({ caller }) func deleteProfile() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete profiles");
    };

    if (not (profileStore.containsKey(caller))) {
      Runtime.trap("Cannot delete profile: Profile does not exist!");
    };

    profileStore.remove(caller);
  };

  public query ({ caller }) func getProfiles() : async [DatingProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    // Filter out hidden profiles
    profileStore.values().toArray().filter(func(p) { p.isVisible });
  };

  public query ({ caller }) func getPublicProfile(
    principal : Principal,
  ) : async ?DatingProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (profileStore.get(principal)) {
      case (null) { null };
      case (?profile) {
        if (not profile.isVisible) { Runtime.trap("Profile is not publicly visible!") };
        ?profile;
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?DatingProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profileStore.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?DatingProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profileStore.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : DatingProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profileStore.add(caller, profile);
  };

  public query ({ caller }) func getOwnProfile() : async ?DatingProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can see profiles");
    };
    profileStore.get(caller);
  };

  public shared ({ caller }) func hideProfile() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can hide profiles");
    };

    switch (profileStore.get(caller)) {
      case (null) { Runtime.trap("Cannot hide profile: Profile does not exist!") };
      case (?profile) {
        let updated = { profile with isVisible = false };
        profileStore.add(caller, updated);
        true;
      };
    };
  };

  // MATCH LOGIC

  func compareMatches(a : (Principal, Principal, Int), b : (Principal, Principal, Int)) : Order.Order {
    Principal.compare(a.0, b.0);
  };

  func getMatchId(a : Principal, b : Principal) : Nat {
    let comparison = compareMatches((a, b, 0), (b, a, 0));
    switch (comparison) {
      case (#less) { 0 };
      case (#greater) { 0 };
      case (_) { 0 };
    };
  };

  func isDuplicateLike(from : Principal, to : Principal) : Bool {
    switch (likes.get(from)) {
      case (?likedList) {
        likedList.filter(func(p) { p == to }).size() > 0;
      };
      case (null) { false };
    };
  };

  func isDuplicateRejection(from : Principal, to : Principal) : Bool {
    switch (rejections.get(from)) {
      case (?rejectedList) {
        rejectedList.filter(func(p) { p == to }).size() > 0;
      };
      case (null) { false };
    };
  };

  func hasMutualMatch(a : Principal, b : Principal) : Bool {
    let aLikesB = switch (likes.get(a)) {
      case (?likedList) { likedList.filter(func(p) { p == b }).size() > 0 };
      case (null) { false };
    };
    let bLikesA = switch (likes.get(b)) {
      case (?likedList) { likedList.filter(func(p) { p == a }).size() > 0 };
      case (null) { false };
    };
    aLikesB and bLikesA;
  };

  public shared ({ caller }) func likeProfile(liked : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like profiles");
    };

    // Check if already rejected
    switch (rejections.get(liked)) {
      case (?rejectedBy) {
        if (rejectedBy.filter(func(p) { p == caller }).size() > 0) {
          Runtime.trap("You have already been rejected by this profile!");
        };
      };
      case (null) {};
    };

    // Check if already liked
    if (isDuplicateLike(caller, liked)) {
      Runtime.trap("You have already liked this profile!");
    };

    // Save the like
    if (likes.containsKey(caller)) {
      let like = likes.get(caller);
      switch (like) {
        case (?currentLikes) {
          likes.add(caller, currentLikes.concat([liked]));
        };
        case (null) {};
      };
    } else {
      likes.add(caller, [liked]);
    };

    if (hasMutualMatch(caller, liked)) {
      // Store new match
      let matchId = getMatchId(caller, liked);
      let match = {
        user1 = caller;
        user2 = liked;
        timestamp = 0;
      };
      matchStore.add(matchId, match);
      // Return true if match successful
      true;
    } else { false };
  };

  public shared ({ caller }) func rejectProfile(rejected : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject profiles");
    };

    if (isDuplicateRejection(caller, rejected)) {
      Runtime.trap("You have already rejected this profile!");
    };

    if (rejections.containsKey(caller)) {
      let rejection = rejections.get(caller);
      switch (rejection) {
        case (?currentRejections) {
          rejections.add(caller, currentRejections.concat([rejected]));
          return true;
        };
        case (null) {};
      };
      return false;
    } else {
      rejections.add(caller, [rejected]);
      return true;
    };
  };

  public shared ({ caller }) func unmatchProfile(profile : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unmatch profiles");
    };

    // Remove any match
    let matchId = getMatchId(caller, profile);
    matchStore.remove(matchId);
    true;
  };

  func areTheyMatched(user1 : Principal, user2 : Principal) : Bool {
    matchStore.containsKey(getMatchId(user1, user2));
  };

  // MESSAGING

  public shared ({ caller }) func sendMessage(
    recipient : Principal,
    content : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (recipient == caller) {
      Runtime.trap("Cannot send message to yourself!");
    };

    if (not areTheyMatched(caller, recipient)) {
      Runtime.trap("Cannot send message: Only matched users can send messages!");
    };

    let message = {
      sender = caller;
      content;
      timestamp = 0;
    };

    let chatId = getMatchId(caller, recipient);

    switch (chatStore.get(chatId)) {
      case (?existingMessages) {
        chatStore.add(chatId, [message].concat(existingMessages));
      };
      case (null) {
        chatStore.add(chatId, [message]);
      };
    };
    true;
  };

  public shared ({ caller }) func getMessages(entity : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    if (not areTheyMatched(caller, entity)) {
      Runtime.trap("Can only see messages with users you are matched with!");
    };

    switch (chatStore.get(getMatchId(caller, entity))) {
      case (?msgs) { msgs };
      case (null) { [] };
    };
  };
};
