import { useEffect, useState } from "react";
import Square from "./Square";
import Peer from "peerjs";

const states = {
    NOT_CONNECTED: "not_connected",
    PLAYER_X: "player_x",
    PLAYER_O: "player_o",
};
const LOBBY_NAME = "tictactoe-lobby";

// TODO make into component
function LobbyList(props) {
    const friends = props.friends;
    const listItems = friends.map((number) => (
        <li
            onClick={() => {
                document.getElementById("remotepeer").value = number;
            }}
            key={number}
        >
            {number}
        </li>
    ));
    return <ul>{listItems}</ul>;
}

function Board({ squares, onClick }) {
    let [historySquares, setHistorySquares] = useState([
        { squares: Array(9).fill(null) },
    ]);
    const [stepNumber, setStepNumber] = useState(0);
    // const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXisNext] = useState(true);
    //   const winner = calculateWinner(board);

    // peerjs states
    const [peer, setPeer] = useState(new Peer());
    const [peerId, setPeerId] = useState(null);
    const [conn, setConn] = useState(null);
    const [connState, setConnState] = useState(states.NOT_CONNECTED);
    const [inLobby, setInLobby] = useState([]);

    const renderSquare = (i) => {
        return <Square value={squares[i]} onClick={() => handleClick(i)} />;
    };

    useEffect(() => {
        // connect
        peer.on("open", (id) => {
            // this.setState({ peer_id: id });
            setPeerId(id);
            let lconn = peer.connect(LOBBY_NAME);
            lconn.on("open", () => {
                console.log("connected to lobby");
                let lobby_query = () => {
                    lconn.send("QUERY");
                    if (connState === states.NOT_CONNECTED) {
                        lconn.send("READY");
                    }
                    window.setTimeout(lobby_query, 1000);
                };
                lobby_query();
            });
            lconn.on("data", (data) => {
                console.log("setting lobby", data);
                //   this.setState({ inLobby: data });
                setInLobby(data);
            });
        });

        // receive
        peer.on("connection", (conn) => {
            console.log("got connection from ", conn.peer);
            if (!conn) {
                setConn(conn);
                setConnState(states.PLAYER_O);
                conn.on("data", (data) => {
                    console.log("Received", data);
                    if (xIsNext) {
                        // handle X press
                        handleFakeClick(Number(data));
                    }
                });
            } else {
                console.log("already connected");
                conn.close();
            }
        });
    }, []);

    function connect() {
        let rp = document.getElementById("remotepeer").value;
        console.log("connect to ", rp);
        let conn = peer.connect(rp);
        setConn(conn);
        setConnState(states.PLAYER_X);
        conn.on("open", () => {
            console.log("connection open");
        });
        conn.on("data", (data) => {
            console.log("Received back ", data);
            if (!xIsNext) {
                // handle O press
                handleFakeClick(Number(data));
            }
        });
    }

    function handleClick(i) {
        if (connState === states.PLAYER_X && xIsNext) {
            handleFakeClick(i);
        } else if (connState === states.PLAYER_O && !xIsNext) {
            handleFakeClick(i);
        }
    }

    function handleFakeClick(i) {
        const history = historySquares.slice(0, stepNumber + 1); // This ensures that when we go back in time and make a new move, we throw away all the moves from that point.
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) return;
        conn.send(i);
        squares[i] = xIsNext ? "X" : "O";
        setHistorySquares(history.concat([{ squares: squares }]));
        setStepNumber(history.length);
        setXisNext(!xIsNext);
    }

    const jumpTo = (step) => {
        setStepNumber(step);
        setXisNext(step % 2 === 0);
    };

    const render = () => {
        const history = historySquares;
        const current = history[stepNumber];
        const winner = calculateWinner(current.squares);
        const moves = history.map((step, move) => {
            const desc = move ? "Go to move #" + move : "Go to game start";
            return (
                <li key={move}>
                    <button onClick={() => jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner != null) {
            if (winner === "draw") {
                status = "Game is a draw";
            } else {
                status = "Winner: " + winner;
            }
        } else {
            status = "Next player: " + (xIsNext ? "X" : "O");
        }

        return [current, moves, status];
    };

    const [current, moves, status] = render();

    let connStatus = connState;

    return (
        <div>
            <div>my peer id is: {peerId}</div>

            <input type="text" placeholder="remote peer id" id="remotepeer" />
            <input type="submit" value="connect" onClick={() => connect()} />

            <div className="lobby">
                <h3>Click a user to challenge</h3>
                <div className="list">
                    <LobbyList friends={inLobby} />
                </div>
            </div>

            <div className="board-row">
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className="board-row">
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className="board-row">
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    );
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return squares[a];
        }
    }
    let filledSquares = 0;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i]) {
            filledSquares++;
        }
    }
    if (filledSquares === squares.length) {
        return "draw";
    } else {
        return null;
    }
}

export default Board;
