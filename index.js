import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/* 
 run with C:\wamp\www\dev\js_course\React\noughts_crosses_npm>npm start
 Optional (npm start does this - slowly): http://localhost:3000/
 
index.js:1375 Warning: Each child in a list should have a unique "key" prop.
Check the render method of `Board`. See https://fb.me/react-warning-keys for more information.
A: Add key to renderSquare and each board-row.
This also works as it's unique per line in renderSquare: key={i % 3}
*/

function Square(props) {
    const currentStep = props.currentStep ? "currentStep" : "";
    const win = props.win ? "win" : "";
    
    return (
        <button className = {`square ${currentStep} ${win}`} onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}

function HistoryToggle(props) {
    const toggleLabel = props.ascending ? "Descending" : "Ascending";
    
    return (
        <button onClick={() => props.onClick()}>
            {toggleLabel}
        </button>
    );
};

class Board extends React.Component {
    renderSquare(i) {
        const currentStep = (i === this.props.square);
        const win = this.props.winLine && this.props.winLine.includes(i);
        
        return (
            <Square 
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                currentStep={currentStep}
                key={i}
                win={win}
            />
        );
    }

    render() {
        const width = 3;
        const height = 3;
        let rows = [];
        
        for (let row = 0; row < height; row++) {
            let cols = [];
            for (let col = 0; col < width; col++) {
                let square = row * width + col;
                cols.push(this.renderSquare(square));
            }
            rows.push(<div className="board-row" key={row}>{cols}</div>);
        }
        
        return (
            <div>{rows}</div>
        );
    }
};

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                square: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            historyAscending: true
        };
    }
    
    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        
        if (calculateWinner(squares, this.state.stepNumber).winner || squares[i]) {
            return;
        }
//        const squares = this.state.squares;
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                square: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }
    
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    handleHistoryToggle() {
        this.setState({
            historyAscending: !this.state.historyAscending
        });
    }
    
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares, this.state.stepNumber);
        const winLine = winner.winLine;
        
        const moves = history.map((step, move) => {
            const boardWidth = 3;
            const col = step.square % boardWidth;
            const row = Math.floor(step.square / boardWidth);
            const desc = move ? 
                `Go to move #${move} at (${col}, ${row})` :
                'Go to game start';
            const currentStep = (this.state.stepNumber === move) ? "currentStep" : "";
            return (
                <li key={move}>
                    <button 
                        className = {currentStep}
                        onClick={() => this.jumpTo(move)}
                    >
                    {desc}
                    </button>
                </li>
            );
        });
        
        let status;
        if (winner.winner) {
            status = 'Winner: ' + winner.winner;
        } else {
            if (winner.isDraw) {
                status = 'Draw';
            } else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
        }
        
        if (!this.state.historyAscending) {
            moves.reverse();
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        square={current.square}
                        winLine={winLine}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <HistoryToggle 
                            onClick={() => this.handleHistoryToggle()}
                            ascending={this.state.historyAscending}
                        />
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares, stepNumber) {
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
  const maxStepNumber = squares.length;
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {

        return ({
            winner: squares[a],
            winLine: lines[i],
            isDraw: false
        });
    }
  }
  
  return ({
      winner: null,
      winLine: null,
      isDraw: (stepNumber === maxStepNumber)
  });
}