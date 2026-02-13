import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Matches {
    public func compare(a : ChatId, b : ChatId) : Order.Order {
      switch (Principal.compare(a.user1, b.user1)) {
        case (#equal) { Principal.compare(a.user2, b.user2) };
        case (comparison) { comparison };
      };
    };
  };

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
    phoneNumber : ?Text;
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

  type SignalingMessage = {
    sender : Principal;
    signalingData : Text;
    timestamp : Int;
  };

  type ChatId = {
    user1 : Principal;
    user2 : Principal;
  };

  type SignalingResult = {
    #Success : Text;
    #NotMatched;
    #Unmatched;
    #InvalidData;
    #TryAgain;
    #InvalidOperation;
    #BufferFull;
  };

  // State Storage
  let profileStore = Map.empty<Principal, DatingProfile>();
  let matchStore = Map.empty<ChatId, Match>();
  let chatStore = Map.empty<ChatId, [Message]>();
  let likes = Map.empty<Principal, [Principal]>();
  let rejections = Map.empty<Principal, [Principal]>();
  let signalingStore = Map.empty<ChatId, [SignalingMessage]>();

  // Authentication
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // MATCH LOGIC

  public query ({ caller }) func getMatches() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };
    let matches = matchStore.toArray().map(
      func((chatId, _)) {
        if (chatId.user1 == caller) { chatId.user2 } else { chatId.user1 };
      }
    );
    matches;
  };

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
    // Filter out hidden profiles and remove phone numbers for privacy
    profileStore.values().toArray().filter(func(p) { p.isVisible }).map(func(p) {
      { p with phoneNumber = null }
    });
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
        // Only show phone number if users are matched
        let showPhone = areTheyMatched(caller, principal);
        if (showPhone) {
          ?profile;
        } else {
          ?{ profile with phoneNumber = null };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?DatingProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    // Users can see their own full profile including phone number
    profileStore.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?DatingProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    // Users can view their own full profile
    if (caller == user) {
      return profileStore.get(user);
    };

    // Admins can view any profile but without phone number (privacy protection)
    return switch (profileStore.get(user)) {
      case (null) { null };
      case (?profile) { ?{ profile with phoneNumber = null } };
    };
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
    // Users can see their own full profile including phone number
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

  func normalizeChatId(a : Principal, b : Principal) : ChatId {
    if (a.toText() < b.toText()) { { user1 = a; user2 = b } } else {
      { user1 = b; user2 = a };
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

  func areTheyMatched(user1 : Principal, user2 : Principal) : Bool {
    let normalizedId = normalizeChatId(user1, user2);
    matchStore.containsKey(normalizedId);
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
      let normalizedId = normalizeChatId(caller, liked);
      let match = {
        user1 = caller;
        user2 = liked;
        timestamp = 0;
      };
      matchStore.add(normalizedId, match);
      // Return true if match successful
      true;
    } else { false };
  };

  public shared ({ caller }) func rejectProfile(rejected : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject profiles");
    };

    switch (rejections.get(caller)) {
      case (?rejectedList) {
        if (rejectedList.filter(func(p) { p == rejected }).size() > 0) {
          // Profile is already in the rejected set
          Runtime.trap("You have already rejected this profile!");
        } else {
          // Add the new rejection to the set
          rejections.add(caller, rejectedList.concat([rejected]));
          true;
        };
      };
      case (null) {
        // Rejections map is empty, create new array with rejected profile
        rejections.add(caller, [rejected]);
        true;
      };
    };
  };

  public shared ({ caller }) func unmatchProfile(profile : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unmatch profiles");
    };

    // Verify the caller is actually matched with this profile
    if (not areTheyMatched(caller, profile)) {
      Runtime.trap("Unauthorized: Can only unmatch profiles you are matched with");
    };

    // Remove any match
    let normalizedId = normalizeChatId(caller, profile);
    matchStore.remove(normalizedId);
    true;
  };

  // SIGNALING RELAY FEATURE (Only call if there is a match! No data gets stored)

  public shared ({ caller }) func sendVideoCallSignaling(
    recipient : Principal,
    signalingData : Text,
  ) : async SignalingResult {
    // Required authorization
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send signaling data");
    };

    // Prevent self signaled-data
    if (recipient == caller) {
      return #InvalidOperation;
    };

    // Check recipient has video calling enabled
    let recipientProfile = switch (profileStore.get(recipient)) {
      case (null) { return #NotMatched };
      case (?profile) {
        if (not profile.hasVideoChatEnabled) {
          return #NotMatched;
        } else {
          profile;
        };
      };
    };

    // Only allow signaling if matched
    if (not areTheyMatched(caller, recipient)) {
      return #Unmatched;
    };

    // Validate signaling data
    if (signalingData.size() == 0) {
      return #InvalidData;
    };

    // Create signaling message
    let message = {
      sender = caller;
      signalingData;
      timestamp = 0;
    };

    // Update signaling store
    let chatId = normalizeChatId(caller, recipient);
    let newMessages = switch (signalingStore.get(chatId)) {
      case (?existingMessages) {
        if (existingMessages.size() >= 10) {
          return #BufferFull;
        };
        [message].concat(existingMessages);
      };
      case (null) { [message] };
    };
    signalingStore.add(chatId, newMessages);

    // Return success
    #Success("Video call signaling sent successfully");
  };

  public query ({ caller }) func getUnreadSignalingMessages(
    chatId : ChatId,
    lastTimestamp : Int,
  ) : async [SignalingMessage] {
    // Authorization check: Only users can retrieve signaling messages
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve signaling messages");
    };

    // Verify caller is part of the chat (match verification)
    let normalizedChatId = normalizeChatId(chatId.user1, chatId.user2);
    switch (matchStore.get(normalizedChatId)) {
      case (?match) {
        if (match.user1 != caller and match.user2 != caller) {
          Runtime.trap("Unauthorized: Can only retrieve signaling messages from your own matches");
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: Invalid chat ID or no match found");
      };
    };

    switch (signalingStore.get(normalizedChatId)) {
      case (?messages) {
        messages.filter(func(m) { m.timestamp > lastTimestamp });
      };
      case (null) { [] };
    };
  };

  // MESSAGING

  public shared ({ caller }) func sendMessage(
    recipient : Principal,
    content : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (recipient == caller) { Runtime.trap("Cannot send message to yourself!") };

    if (not areTheyMatched(caller, recipient)) {
      Runtime.trap("Cannot send message: Only matched users can send messages!");
    };

    let message = {
      sender = caller;
      content;
      timestamp = 0;
    };

    let chatId = normalizeChatId(caller, recipient);

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

  public query ({ caller }) func getMessages(entity : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    if (not areTheyMatched(caller, entity)) {
      Runtime.trap("Can only see messages with users you are matched with!");
    };

    switch (chatStore.get(normalizeChatId(caller, entity))) {
      case (?msgs) { msgs };
      case (null) { [] };
    };
  };
};
