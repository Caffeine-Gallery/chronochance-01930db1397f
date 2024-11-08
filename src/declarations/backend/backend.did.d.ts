import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Treasure {
  'x' : bigint,
  'y' : bigint,
  'id' : bigint,
  'value' : bigint,
  'timeCreated' : bigint,
}
export interface _SERVICE {
  'collectTreasure' : ActorMethod<[bigint, bigint], [] | [bigint]>,
  'endGame' : ActorMethod<[], undefined>,
  'getGameState' : ActorMethod<
    [],
    {
      'active' : boolean,
      'score' : bigint,
      'highScore' : bigint,
      'treasures' : Array<Treasure>,
    }
  >,
  'startGame' : ActorMethod<[], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
