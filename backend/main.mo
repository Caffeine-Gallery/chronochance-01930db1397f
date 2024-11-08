import Bool "mo:base/Bool";

import Timer "mo:base/Timer";
import Random "mo:base/Random";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Iter "mo:base/Iter";

actor TreasureHunt {
    type Treasure = {
        id: Nat;
        x: Nat;
        y: Nat;
        value: Nat;
        timeCreated: Int;
    };

    stable var currentId : Nat = 0;
    stable var gameActive : Bool = false;
    stable var highScore : Nat = 0;
    
    private var treasures = Buffer.Buffer<Treasure>(10);
    private var timerId : Nat = 0;
    private var currentScore : Nat = 0;

    private func generateRandom(max: Nat) : async Nat {
        let seed = await Random.blob();
        let random = Random.Finite(seed);
        switch (random.byte()) {
            case null { 0 };
            case (?byte) {
                (Nat8.toNat(byte) * max) / 256;
            };
        };
    };

    private func createTreasure() : async () {
        let x = await generateRandom(9);
        let y = await generateRandom(9);
        let randomValue = await generateRandom(10);
        let value = randomValue + 1;

        let treasure : Treasure = {
            id = currentId;
            x = x;
            y = y;
            value = value;
            timeCreated = Time.now();
        };

        currentId += 1;
        treasures.add(treasure);

        let now = Time.now();
        treasures.filterEntries(func(_, t) = (now - t.timeCreated) < 10_000_000_000);
    };

    public func startGame() : async () {
        if (not gameActive) {
            gameActive := true;
            currentScore := 0;
            treasures.clear();
            
            timerId := Timer.setTimer(
                #seconds(0), 
                func() : async () {
                    if (gameActive) {
                        await createTreasure();
                    };
                }
            );
            
            ignore Timer.setTimer(
                #seconds(60), 
                func() : async () {
                    await endGame();
                }
            );
        };
    };

    public func endGame() : async () {
        gameActive := false;
        Timer.cancelTimer(timerId);
        if (currentScore > highScore) {
            highScore := currentScore;
        };
        treasures.clear();
    };

    public func collectTreasure(x: Nat, y: Nat) : async ?Nat {
        if (not gameActive) {
            return null;
        };

        let treasureArray = Buffer.toArray(treasures);
        for (i in Iter.range(0, treasures.size() - 1)) {
            let treasure = treasureArray[i];
            if (treasure.x == x and treasure.y == y) {
                ignore treasures.remove(i);
                currentScore += treasure.value;
                return ?treasure.value;
            };
        };
        return null;
    };

    public query func getGameState() : async {
        treasures: [Treasure];
        score: Nat;
        highScore: Nat;
        active: Bool;
    } {
        {
            treasures = Buffer.toArray(treasures);
            score = currentScore;
            highScore = highScore;
            active = gameActive;
        }
    };
}
