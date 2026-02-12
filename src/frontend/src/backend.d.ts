import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    sender: Principal;
    timestamp: bigint;
}
export interface DatingProfile {
    age: number;
    profilePicUrl: string;
    interests: Array<string>;
    bioSections: Array<string>;
    languages: Array<string>;
    links: Array<string>;
    gender: Gender;
    isVisible: boolean;
    personalityTraits: Array<string>;
    datingPreferences: DatingPreferences;
    socialMedia: Array<string>;
    lastName: string;
    location: string;
    hasVideoChatEnabled: boolean;
    hobbies: Array<string>;
    images: Array<string>;
    firstName: string;
}
export interface DatingPreferences {
    preferredGenders: Array<Gender>;
    minAge: number;
    minDistance: bigint;
    maxAge: number;
    maxDistance: bigint;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProfile(profile: DatingProfile): Promise<void>;
    deleteProfile(): Promise<void>;
    getCallerUserProfile(): Promise<DatingProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessages(entity: Principal): Promise<Array<Message>>;
    getOwnProfile(): Promise<DatingProfile | null>;
    getProfiles(): Promise<Array<DatingProfile>>;
    getPublicProfile(principal: Principal): Promise<DatingProfile | null>;
    getUserProfile(user: Principal): Promise<DatingProfile | null>;
    hideProfile(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    likeProfile(liked: Principal): Promise<boolean>;
    rejectProfile(rejected: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: DatingProfile): Promise<void>;
    sendMessage(recipient: Principal, content: string): Promise<boolean>;
    unmatchProfile(profile: Principal): Promise<boolean>;
    updateProfile(profile: DatingProfile): Promise<void>;
}
