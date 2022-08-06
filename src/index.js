import React from "react";
import ReactDOM from "react-dom/client";
import Peer from "peerjs";
import "./index.css";

const LOBBY_NAME = "tictactoe-lobby";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

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

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

const states = {
  NOT_CONNECTED: "not_connected",
  PLAYER_X: "player_x",
  PLAYER_O: "player_o",
};

class Game extends React.Component {
  componentDidMount() {
    let lobby = new Peer(LOBBY_NAME);
    lobby.on("open", (id) => {
      console.log("Lobby peer ID is: " + id);
    });

    lobby.on("connection", (conn) => {
      console.log("lobby connection ", conn.peer);
      conn.on("data", (data) => {
        console.log(data);
        conn.send(["hello", "world"]);
      });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      peer: new Peer(),
      peer_id: null,
      conn: null,
      connState: states.NOT_CONNECTED,
      inLobby: [],
    };
    this.state.peer.on("open", (id) => {
      this.setState({ peer_id: id });
      let lconn = this.state.peer.connect(LOBBY_NAME);
      lconn.on("open", (data) => {
        console.log("connecting to lobby");
        lconn.send("Query");
      });
      lconn.on("data", (data) => {
        console.log("setting lobby ", data);
        this.setState({ inLobby: data });
      });
    });
    this.state.peer.on("connection", (conn) => {
      console.log("got connection from ", conn.peer);
      if (!this.state.conn) {
        this.setState({ conn: conn, connState: states.PLAYER_O });
        conn.on("data", (data) => {
          console.log("Received", data);
          if (this.state.xIsNext) {
            // handle X press
            this.handleFakeClick(Number(data));
          }
        });
      } else {
        console.log("already connected");
        conn.close();
      }
    });
  }

  connect() {
    let rp = document.getElementById("remotepeer").value;
    console.log("connect to ", rp);
    let conn = this.state.peer.connect(rp);
    this.setState({ conn: conn });
    this.setState({ conn: conn, connState: states.PLAYER_X });
    conn.on("open", () => {
      console.log("connection open");
    });
    conn.on("data", (data) => {
      console.log("Received back ", data);
      if (!this.state.xIsNext) {
        // handle O press
        this.handleFakeClick(Number(data));
      }
    });
  }

  handleClick(i) {
    if (this.state.connState === states.PLAYER_X && this.state.xIsNext) {
      this.handleFakeClick(i);
    } else if (
      this.state.connState === states.PLAYER_O &&
      !this.state.xIsNext
    ) {
      this.handleFakeClick(i);
    }
  }

  handleFakeClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1); // This ensures that when we go back in time and make a new move, we throw away all the moves from that point.
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    this.state.conn.send(i);
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        // concat() method does not mutate the original array
        {
          squares: squares,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
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
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    let connStatus = this.state.connState;

    return (
      <div>
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{connStatus}</div>
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
        <div>my peer id is: {this.state.peer_id}</div>
        <input type="text" placeholder="remote peer id" id="remotepeer" />
        <input type="submit" value="connect" onClick={() => this.connect()} />
        <div className="lobby">
          <h3>Click a user to challenge</h3>
          <div className="list">
            <LobbyList friends={this.state.inLobby} />
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

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
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
