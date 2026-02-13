import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";

module {
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

  type OldActor = {
    profileStore : Map.Map<Principal, DatingProfile>;
    matchStore : Map.Map<Nat, Match>;
    chatStore : Map.Map<Nat, [Message]>;
    likes : Map.Map<Principal, [Principal]>;
    rejections : Map.Map<Principal, [Principal]>;
    signalingStore : Map.Map<Nat, [SignalingMessage]>;
  };

  type NewActor = {
    profileStore : Map.Map<Principal, DatingProfile>;
    matchStore : Map.Map<ChatId, Match>;
    chatStore : Map.Map<ChatId, [Message]>;
    likes : Map.Map<Principal, [Principal]>;
    rejections : Map.Map<Principal, [Principal]>;
    signalingStore : Map.Map<ChatId, [SignalingMessage]>;
  };

  public func run(old : OldActor) : NewActor {
    {
      profileStore = old.profileStore;
      matchStore = Map.empty<ChatId, Match>();
      chatStore = Map.empty<ChatId, [Message]>();
      likes = old.likes;
      rejections = old.rejections;
      signalingStore = Map.empty<ChatId, [SignalingMessage]>();
    };
  };
};
