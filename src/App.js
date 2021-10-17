import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useInterval from "./hooks/useInterval";
import useWindowSize from "./hooks/useWindowSize";

const Wrapper = styled.div`
  margin-top: 10px;
  width: 100%;
  height: 100%;
  display: grid;
  align-content: center;
  justify-content: center;
`;
const Grid = styled.div`
  display: grid;
  grid-template-rows: repeat(${(props) => props.dimension}, 1fr);
`;
const Row = styled.div`
  display: flex;
`;
const Cell = styled.div`
  cursor: pointer;
  width: ${(props) =>
    props.w > props.h
      ? props.h / props.dimension + "px"
      : props.w / props.dimension + "px"};
  height: ${(props) =>
    props.w > props.h
      ? props.h / props.dimension + "px"
      : props.w / props.dimension + "px"};
  border: 1px solid black;
  background-color: ${(props) =>
    props.isVisited
      ? "violet"
      : props.isPath
      ? "yellow"
      : props.isWall
      ? "black"
      : ""};
`;

function App() {
  const { width, height } = useWindowSize();
  const dim = 20;
  const [isRunning, setisRunning] = useState(false);
  const [isFinished, setisFinished] = useState(false);
  const [reset, setReset] = useState(false);
  const [gridState, setGridState] = useState([]);
  //const [path, setPath] = useState([]);
  let path = useRef([]);
  let start = useRef(null);
  let end = useRef(null);
  let openSet = useRef([]);
  let closedSet = useRef([]);
  let x = useRef(0);
  //creating grid
  useEffect(() => {
    let grid = [];
    let temp = [];
    for (let i = 0; i < dim; i++) {
      grid.push(temp);
      for (let j = 0; j < dim; j++) {
        if (i === 0 && j === 0) {
          temp.push({
            i,
            j,
            g: 0,
            h: 0,
            f: 0,
            isVisited: false,
            neighbours: [],
            previous: undefined,
            isPath: false,
            isWall: false,
          });
        } else {
          temp.push({
            i,
            j,
            g: 0,
            h: 0,
            f: 0,
            isVisited: false,
            neighbours: [],
            previous: undefined,
            isPath: false,
            isWall: false,
          });
        }
      }
      temp = [];
    }
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        if (i - 1 >= 0) {
          grid[i][j].neighbours.push(grid[i - 1][j]);
        }
        if (j + 1 < dim) {
          grid[i][j].neighbours.push(grid[i][j + 1]);
        }
        if (i + 1 < dim) {
          grid[i][j].neighbours.push(grid[i + 1][j]);
        }
        if (j - 1 >= 0) {
          grid[i][j].neighbours.push(grid[i][j - 1]);
        }
      }
    }

    console.log(grid);

    setGridState(grid);
    start.current = grid[0][0];
    end.current = grid[19][19];
    openSet.current = [start.current];
  }, []);
  useEffect(() => {
    let grid = [];
    let temp = [];
    for (let i = 0; i < dim; i++) {
      grid.push(temp);
      for (let j = 0; j < dim; j++) {
        if (i === 0 && j === 0) {
          temp.push({
            i,
            j,
            g: 0,
            h: 0,
            f: 0,
            isVisited: false,
            neighbours: [],
            previous: undefined,
            isPath: false,
            isWall: false,
          });
        } else {
          temp.push({
            i,
            j,
            g: 0,
            h: 0,
            f: 0,
            isVisited: false,
            neighbours: [],
            previous: undefined,
            isPath: false,
            isWall: false,
          });
        }
      }
      temp = [];
    }
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        if (i - 1 >= 0) {
          grid[i][j].neighbours.push(grid[i - 1][j]);
        }
        if (j + 1 < dim) {
          grid[i][j].neighbours.push(grid[i][j + 1]);
        }
        if (i + 1 < dim) {
          grid[i][j].neighbours.push(grid[i + 1][j]);
        }
        if (j - 1 >= 0) {
          grid[i][j].neighbours.push(grid[i][j - 1]);
        }
      }
    }

    console.log(grid);

    setGridState(grid);
    start.current = grid[0][0];
    end.current = grid[19][19];
    openSet.current = [start.current];
    x.current = 0;
    closedSet.current = [];
    path.current = [];
  }, [reset]);
  const removeFromOpenSet = (passedSet, passedIdx) => {
    let temp = passedSet;
    let idx = temp.findIndex(
      (el) => el.i === passedIdx.i && el.j === passedIdx.j
    );
    temp.splice(idx, 1);
    openSet.current = temp;
  };
  const heuristic = (a, b) => {
    let distance = Math.hypot(a.i - b.i, b.j - a.j);
    //let distance = Math.abs(a.i - b.i) + Math.abs(b.j - a.j);
    return distance;
  };
  const addWall = (e, i, j) => {
    if (!isRunning) {
      if (e.buttons === 1) {
        console.log(i, j);
        let items = [...gridState];
        let item = gridState[i][j];
        item.isWall = true;
        items[i][j] = item;
        if (i - 1 >= 0) {
          console.log("up");
          let idx = items[i - 1][j].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          console.log("up idx " + idx);
          if (!items[i - 1][j].neighbours[idx].isWall) {
            items[i - 1][j].neighbours[idx].isWall = true;
          }
        }
        if (j + 1 < dim) {
          console.log("right");
          let idx = items[i][j + 1].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          console.log("right idx " + idx);
          if (!items[i][j + 1].neighbours[idx].isWall) {
            items[i][j + 1].neighbours[idx].isWall = true;
          }
        }
        if (i + 1 < dim) {
          console.log("down");
          let idx = items[i + 1][j].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          console.log("down idx " + idx);
          if (!items[i + 1][j].neighbours[idx].isWall) {
            items[i + 1][j].neighbours[idx].isWall = true;
          }
        }
        if (j - 1 >= 0) {
          console.log("left");
          let idx = items[i][j - 1].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          console.log("left idx " + idx);
          if (!items[i][j - 1].neighbours[idx].isWall) {
            items[i][j - 1].neighbours[idx].isWall = true;
          }
        }

        setGridState(items);
        console.log(gridState);
      }
    }
  };
  const handleChange = (i, j) => {
    let items = [...gridState];
    let item = [gridState[i][j]];
    item.isVisited = true;
    items[i][j] = item;
    setGridState(items);
  };
  const handlePath = () => {
    let items = [...gridState];
    for (let i = 0; i < path.current.length; i++) {
      let item = [path.current[path.current[i].i][path.current[i].j]];
      item.isPath = true;
      items[path.current[i].i][path.current[i].j] = item;
    }
    setGridState(items);
  };

  const aStar = () => {
    if (openSet.current.length > 0) {
      for (let i = 0; i < openSet.current.length; i++) {
        if (openSet.current[i].f < openSet.current[x.current].f) {
          x.current = i;
        }
      }
      const current = openSet.current[x.current];
      removeFromOpenSet(openSet.current, openSet.current[x.current]);
      closedSet.current.push(current);

      if (current === end.current) {
        setisRunning(false);
        let tempCurrent = current;
        path.current.push(tempCurrent);
        while (tempCurrent.previous) {
          path.current.push(tempCurrent.previous);
          tempCurrent = tempCurrent.previous;
          console.log(path.current);
        }
        handlePath();
        setisFinished(true);
      }

      for (let i = 0; i < current.neighbours.length; i++) {
        if (
          !closedSet.current.includes(current.neighbours[i]) &&
          !current.neighbours[i].isWall
        ) {
          let tempG = current.g + 1;
          if (openSet.current.includes(current.neighbours[i])) {
            if (tempG < current.neighbours[i].g) {
              current.neighbours[i].g = tempG;
            }
          } else {
            current.neighbours[i].g = tempG;
            openSet.current.push(current.neighbours[i]);
          }
          current.neighbours[i].h = heuristic(
            current.neighbours[i],
            end.current
          );
          current.neighbours[i].f =
            current.neighbours[i].h + current.neighbours[i].g;
          current.neighbours[i].previous = current;
        }
      }
      console.log(current);
      handleChange(current.i, current.j);
    } else {
      setisRunning(false);
      setisFinished(true);
      alert("No solution");
    }
  };

  useInterval(aStar, isRunning ? 10 : null);
  return (
    <Wrapper>
      <button disabled={isFinished} onClick={() => setisRunning(!isRunning)}>
        {isRunning ? "Stop" : "Start"}
      </button>
      <button
        onClick={() => {
          setReset(!reset);
          setisFinished(false);
        }}
      >
        Reset
      </button>
      <Grid dimension={dim}>
        {gridState.map((row, i) => {
          return (
            <Row key={i}>
              {row.map((cell, j) => {
                return (
                  <Cell
                    w={width}
                    h={height}
                    dimension={dim + 3}
                    style={{
                      backgroundColor:
                        i === 0 && j === 0
                          ? "green"
                          : i === 19 && j === 19
                          ? "red"
                          : "",
                    }}
                    key={j}
                    onMouseOver={(e) => addWall(e, i, j)}
                    onMouseDown={(e) => addWall(e, i, j)}
                    isVisited={cell.isVisited}
                    isPath={cell.isPath}
                    isWall={cell.isWall}
                  ></Cell>
                );
              })}
            </Row>
          );
        })}
      </Grid>
    </Wrapper>
  );
}

export default App;
