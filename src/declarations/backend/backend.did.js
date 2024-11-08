export const idlFactory = ({ IDL }) => {
  const Treasure = IDL.Record({
    'x' : IDL.Nat,
    'y' : IDL.Nat,
    'id' : IDL.Nat,
    'value' : IDL.Nat,
    'timeCreated' : IDL.Int,
  });
  return IDL.Service({
    'collectTreasure' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Opt(IDL.Nat)], []),
    'endGame' : IDL.Func([], [], []),
    'getGameState' : IDL.Func(
        [],
        [
          IDL.Record({
            'active' : IDL.Bool,
            'score' : IDL.Nat,
            'highScore' : IDL.Nat,
            'treasures' : IDL.Vec(Treasure),
          }),
        ],
        ['query'],
      ),
    'startGame' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
