import { useEffect, useState } from "react";
import Peer from "peerjs";
import Board from "./Board";

const LOBBY_NAME = "tictactoe-lobby";




function Game() {
    // let [historySquares, setHistorySquares] = useState([
    //     { squares: Array(9).fill(null) },
    // ]);
    // const [stepNumber, setStepNumber] = useState(0);
    // // const [board, setBoard] = useState(Array(9).fill(null));
    // const [xIsNext, setXisNext] = useState(true);
    // //   const winner = calculateWinner(board);

    // // peerjs states
    // const [peer, setPeer] = useState(new Peer());
    // const [peerId, setPeerId] = useState(null);
    // const [conn, setConn] = useState(null);
    // const [connState, setConnState] = useState(states.NOT_CONNECTED);
    // const [inLobby, setInLobby] = useState([]);

    useEffect(() => {
        let peers = {};
        let lobby = new Peer(LOBBY_NAME);

        lobby.on("open", (id) => {
            console.log("Lobby peer ID is: " + id);
        });

        lobby.on("connection", (conn) => {
            console.log("lobby connection", conn.peer);
            conn.on("data", (data) => {
                if (data === "READY") {
                    peers[conn.peer] = new Date().getTime();
                }
                if (data === "QUERY") {
                    conn.send(Object.keys(peers));
                }
            });
        });

        function expire() {
            for (let k in peers) {
                let now = new Date().getTime();
                if (now - peers[k] > 3000) {
                    delete peers[k];
                }
            }
            window.setTimeout(expire, 1000);
        }
        expire();
    }, []);

  

    return (
        <div className="game-container">
            <div className="game">
                <div className="game-board">
                    <Board/>
                </div>

                <div className="game-info">
                    {/* <div>{connStatus}</div>
                    <div>{status}</div> */}
                    {/* <ol>{moves}</ol> */}
                </div>
            </div>

           

           
        </div>
    );
}



export default Game;
