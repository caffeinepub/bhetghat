import { Principal } from '@dfinity/principal';
import type { ChatId } from '../backend';

export function computeChatId(principal1: Principal, principal2: Principal): ChatId {
  const p1Text = principal1.toString();
  const p2Text = principal2.toString();
  
  // Sort principals to ensure consistent ordering
  if (p1Text < p2Text) {
    return { user1: principal1, user2: principal2 };
  } else {
    return { user1: principal2, user2: principal1 };
  }
}
