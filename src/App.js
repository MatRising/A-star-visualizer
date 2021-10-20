import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useInterval from "./hooks/useInterval";
import useWindowSize from "./hooks/useWindowSize";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  align-content: center;
  justify-content: center;
  position: relative;
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
  background-color: ${(props) => props.color};
`;
const NaviWrapper = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  margin: 10px;
  cursor: grab;
  z-index: 1;
`;
const Menu = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  margin: 10px;
  cursor: pointer;
`;
const Patty = styled.div`
  width: 25px;
  height: 4px;
  background-color: white;
  margin: 2px 0;
`;
const Button = styled.button`
  width: ${(props) =>
    props.minimize ? "30px" : props.w < 400 ? "80px" : "100px"};
  height: 30px;
  background-color: ${(props) =>
    props.start ? "#00A170" : props.stop ? "#D2386C" : "#008CBA"};
  border: 1px solid transparent;
  color: white;
  margin: 3px;
  cursor: pointer;
  align-self: ${(props) => (props.minimize ? "flex-end" : "")};
`;
const Backdrop = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: grey;
  color: white;
  padding: 50px;
  background-color: rgba(0, 0, 0, 0.8);
`;

function App() {
  const { width, height } = useWindowSize();
  const [dim, setDim] = useState(20);
  const [isOpen, setisOpen] = useState(true);
  const [isRunning, setisRunning] = useState(false);
  const [isFinished, setisFinished] = useState(false);
  const [reset, setReset] = useState(false);
  const [gridState, setGridState] = useState([]);
  const [touchStart, settouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, settouchEnd] = useState({ x: 0, y: 0 });
  const [helper, setHelper] = useState(false);
  const [isAddingWalls, setisAddingWalls] = useState(true);
  let path = useRef([]);
  let start = useRef(undefined);
  let end = useRef(undefined);
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
            neighbours: [],
            previous: undefined,
            isStart: false,
            isEnd: false,
            isVisited: false,
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
            neighbours: [],
            previous: undefined,
            isStart: false,
            isEnd: false,
            isVisited: false,
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

    setGridState(grid);
    end.current = undefined;
    start.current = undefined;
    //openSet.current = [start.current];
    closedSet.current = [];
    path.current = [];
  }, [reset, dim]);

  useEffect(() => {
    //handling mobile swipes directions and calling addWallMobile
    // width - 100(for margin) + dim(to accout for border)/dim
    let cellSize = (width - 100 + dim * 2) / dim;

    const precision =
      dim === 10 ? cellSize : dim === 20 ? cellSize * 2 : cellSize * 3;
    const isIntercardinal =
      Math.abs(
        Math.abs(touchStart.x - touchEnd.x) -
          Math.abs(touchStart.y - touchEnd.y)
      ) < precision;

    // handling mobile swipes
    if (helper === true) {
      if (isIntercardinal) {
        //intercardinal movements here
        if (touchStart.x - touchEnd.x < 0 && touchEnd.y - touchStart.y < 0) {
          //Southwest -> Northeast
          //up right direction
          let counter = 0;
          for (let pos = touchStart.x; pos < touchEnd.x; pos = pos + cellSize) {
            let elementMouseIsOver = document.elementFromPoint(
              touchStart.x + cellSize * counter,
              touchStart.y - cellSize * counter
            );

            elementMouseIsOver.click();
            counter = counter + 1;
          }
        } else if (
          touchStart.x - touchEnd.x > 0 &&
          touchEnd.y - touchStart.y > 0
        ) {
          //Northeast -> Southwest
          //up left direction
          let counter = 0;
          for (let pos = touchStart.x; pos > touchEnd.x; pos = pos - cellSize) {
            let elementMouseIsOver = document.elementFromPoint(
              touchStart.x - cellSize * counter,
              touchStart.y + cellSize * counter
            );

            elementMouseIsOver.click();
            counter = counter + 1;
          }
        } else if (
          touchStart.x - touchEnd.x > 0 &&
          touchEnd.y - touchStart.y < 0
        ) {
          //Northwest -> Southeast
          //down left direction
          let counter = 0;
          for (let pos = touchStart.x; pos > touchEnd.x; pos = pos - cellSize) {
            let elementMouseIsOver = document.elementFromPoint(
              touchStart.x - cellSize * counter,
              touchStart.y - cellSize * counter
            );
            elementMouseIsOver.click();
            counter = counter + 1;
          }
        } else if (
          touchStart.x - touchEnd.x < 0 &&
          touchEnd.y - touchStart.y > 0
        ) {
          //Southeast -> Northwest
          //donw right direction
          let counter = 0;
          for (let pos = touchStart.x; pos < touchEnd.x; pos = pos + cellSize) {
            let elementMouseIsOver = document.elementFromPoint(
              touchStart.x + cellSize * counter,
              touchStart.y + cellSize * counter
            );

            elementMouseIsOver.click();
            counter = counter + 1;
          }
        }
      } else {
        //cardinal movements here
        if (
          Math.abs(touchStart.x - touchEnd.x) <
          Math.abs(touchStart.y - touchEnd.y)
        ) {
          //vertical swipes
          if (touchStart.y < touchEnd.y) {
            //down swipe
            for (let i = touchStart.y; i < touchEnd.y; i = i + cellSize) {
              let elementMouseIsOver = document.elementFromPoint(
                touchStart.x,
                i
              );
              elementMouseIsOver.click();
            }
          } else {
            //up swipe
            for (let i = touchEnd.y; i < touchStart.y; i = i + cellSize) {
              let elementMouseIsOver = document.elementFromPoint(
                touchStart.x,
                i
              );
              elementMouseIsOver.click();
            }
          }
        } else {
          //horizontal swipes
          if (touchStart.x < touchEnd.x) {
            //left swipe
            for (let i = touchStart.x; i < touchEnd.x; i = i + cellSize) {
              let elementMouseIsOver = document.elementFromPoint(
                i,
                touchStart.y
              );
              elementMouseIsOver.click();
            }
          } else {
            //right swipe
            for (let i = touchEnd.x; i < touchStart.x; i = i + cellSize) {
              let elementMouseIsOver = document.elementFromPoint(
                i,
                touchStart.y
              );
              elementMouseIsOver.click();
            }
          }
        }
      }
    } else if (end.current !== undefined) {
      //so start and end dont end up as walls
      //fix by disabling start and end points as possible walls?
      setHelper(true);
    }
  }, [touchEnd]);

  const addWallMobile = (i, j) => {
    if (!isRunning && helper) {
      let items = [...gridState];
      let item = gridState[i][j];
      item.isWall = isAddingWalls;
      items[i][j] = item;
      if (i - 1 >= 0) {
        let idx = items[i - 1][j].neighbours.findIndex(
          (el) => el.i === i && el.j === j
        );
        if (!items[i - 1][j].neighbours[idx].isWall) {
          items[i - 1][j].neighbours[idx].isWall = isAddingWalls;
        }
      }
      if (j + 1 < dim) {
        let idx = items[i][j + 1].neighbours.findIndex(
          (el) => el.i === i && el.j === j
        );
        if (!items[i][j + 1].neighbours[idx].isWall) {
          items[i][j + 1].neighbours[idx].isWall = isAddingWalls;
        }
      }
      if (i + 1 < dim) {
        let idx = items[i + 1][j].neighbours.findIndex(
          (el) => el.i === i && el.j === j
        );
        if (!items[i + 1][j].neighbours[idx].isWall) {
          items[i + 1][j].neighbours[idx].isWall = isAddingWalls;
        }
      }
      if (j - 1 >= 0) {
        let idx = items[i][j - 1].neighbours.findIndex(
          (el) => el.i === i && el.j === j
        );
        if (!items[i][j - 1].neighbours[idx].isWall) {
          items[i][j - 1].neighbours[idx].isWall = isAddingWalls;
        }
      }
      setGridState(items);
    }
  };

  const addWall = (e, i, j) => {
    if (!isRunning) {
      if (e.buttons === 1) {
        if (start.current === undefined) {
          let all = [...gridState];
          all[i][j].isStart = true;
          start.current = gridState[i][j];
          start.current.isStart = true;
          openSet.current = [start.current];
          setGridState(all);
        } else if (end.current === undefined) {
          let all = [...gridState];
          all[i][j].isEnd = true;
          end.current = gridState[i][j];
          end.current.isEnd = true;
          setGridState(all);
        } else {
          let items = [...gridState];
          let item = gridState[i][j];
          item.isWall = isAddingWalls;
          items[i][j] = item;
          if (i - 1 >= 0) {
            let idx = items[i - 1][j].neighbours.findIndex(
              (el) => el.i === i && el.j === j
            );
            if (!items[i - 1][j].neighbours[idx].isWall) {
              items[i - 1][j].neighbours[idx].isWall = isAddingWalls;
            }
          }
          if (j + 1 < dim) {
            let idx = items[i][j + 1].neighbours.findIndex(
              (el) => el.i === i && el.j === j
            );
            if (!items[i][j + 1].neighbours[idx].isWall) {
              items[i][j + 1].neighbours[idx].isWall = isAddingWalls;
            }
          }
          if (i + 1 < dim) {
            let idx = items[i + 1][j].neighbours.findIndex(
              (el) => el.i === i && el.j === j
            );
            if (!items[i + 1][j].neighbours[idx].isWall) {
              items[i + 1][j].neighbours[idx].isWall = isAddingWalls;
            }
          }
          if (j - 1 >= 0) {
            let idx = items[i][j - 1].neighbours.findIndex(
              (el) => el.i === i && el.j === j
            );
            if (!items[i][j - 1].neighbours[idx].isWall) {
              items[i][j - 1].neighbours[idx].isWall = isAddingWalls;
            }
          }
          setGridState(items);
        }
      } else if (e.nativeEvent.which === 3) {
        let items = [...gridState];
        let item = gridState[i][j];
        item.isWall = false;
        items[i][j] = item;
        if (i - 1 >= 0) {
          let idx = items[i - 1][j].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          if (!items[i - 1][j].neighbours[idx].isWall) {
            items[i - 1][j].neighbours[idx].isWall = false;
          }
        }
        if (j + 1 < dim) {
          let idx = items[i][j + 1].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          if (!items[i][j + 1].neighbours[idx].isWall) {
            items[i][j + 1].neighbours[idx].isWall = false;
          }
        }
        if (i + 1 < dim) {
          let idx = items[i + 1][j].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          if (!items[i + 1][j].neighbours[idx].isWall) {
            items[i + 1][j].neighbours[idx].isWall = false;
          }
        }
        if (j - 1 >= 0) {
          let idx = items[i][j - 1].neighbours.findIndex(
            (el) => el.i === i && el.j === j
          );
          if (!items[i][j - 1].neighbours[idx].isWall) {
            items[i][j - 1].neighbours[idx].isWall = false;
          }
        }
        setGridState(items);
      }
    }
  };
  const handleChange = (i, j) => {
    let items = [...gridState];
    let item = gridState[i][j];
    item.isVisited = true;
    items[i][j] = item;
    setGridState(items);
  };
  const handlePath = () => {
    let items = [...gridState];
    for (let i = 0; i < path.current.length; i++) {
      //let item = [path.current[path.current[i].i][path.current[i].j]];??? what was that?
      let item = path.current[i];
      item.isPath = true;
      items[path.current[i].i][path.current[i].j] = item;
    }
    setGridState(items);
  };
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
  const aStar = () => {
    if (openSet.current.length > 0) {
      x.current = 0;
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
          let newPath = false;
          if (openSet.current.includes(current.neighbours[i])) {
            if (tempG < current.neighbours[i].g) {
              current.neighbours[i].g = tempG;
              newPath = true;
            }
          } else {
            current.neighbours[i].g = tempG;
            newPath = true;
            openSet.current.push(current.neighbours[i]);
          }
          if (newPath) {
            current.neighbours[i].h = heuristic(
              current.neighbours[i],
              end.current
            );
            current.neighbours[i].f =
              current.neighbours[i].h + current.neighbours[i].g;
            current.neighbours[i].previous = current;
          }
        }
      }
      handleChange(current.i, current.j);
    } else {
      setisRunning(false);
      setisFinished(true);
      alert("No solution");
    }
  };

  const determineColor = (
    cellStart,
    cellEnd,
    cellWall,
    cellPath,
    cellVisited
  ) => {
    if (cellStart) {
      return "#00A170";
    } else if (cellEnd) {
      return "#D2386C";
    } else if (cellWall) {
      return "black";
    } else if (cellPath) {
      return "#F5DF4D";
    } else if (cellVisited) {
      return "#926AA6";
    } else return "";
  };
  useInterval(aStar, isRunning ? 10 : null);

  //
  return (
    <Wrapper>
      {isOpen ? (
        <NaviWrapper>
          <Button minimize={true} onClick={() => setisOpen(false)}>
            X
          </Button>
          <div className="flex-grouping">
            <Button
              w={width}
              start
              disabled={isFinished || end.current === undefined}
              onClick={() => setisRunning(!isRunning)}
            >
              {isRunning ? "Stop" : "Start"}
            </Button>
            <Button w={width} onClick={() => setisAddingWalls(!isAddingWalls)}>
              {isAddingWalls ? "RM Walls" : "Add Walls"}
            </Button>
            <Button
              w={width}
              stop
              onClick={() => {
                setReset(!reset);
                setisFinished(false);
                setisRunning(false);
                setHelper(false);
              }}
            >
              Reset
            </Button>
          </div>
          <p style={{ color: "white", margin: "0px" }}>
            {isAddingWalls ? "Adding walls" : "Removing walls"}
          </p>

          <div className="flex-grouping">
            <Button
              w={width}
              onClick={() => {
                setDim(10);
                setReset(!reset);
                setisFinished(false);
                setisRunning(false);
                setHelper(false);
              }}
            >
              Small grid
            </Button>
            <Button
              w={width}
              onClick={() => {
                setDim(20);
                setReset(!reset);
                setisFinished(false);
                setisRunning(false);
                setHelper(false);
              }}
            >
              Mid grid
            </Button>
            <Button
              w={width}
              onClick={() => {
                setDim(30);
                setReset(!reset);
                setisFinished(false);
                setisRunning(false);
                setHelper(false);
              }}
            >
              Big grid
            </Button>
          </div>
        </NaviWrapper>
      ) : (
        <Menu onClick={() => setisOpen(true)}>
          <Patty></Patty>
          <Patty></Patty>
          <Patty></Patty>
        </Menu>
      )}
      {end.current === undefined && (
        <Backdrop absolute>
          {start.current === undefined
            ? "Click to add starting point"
            : end.current === undefined
            ? "Click to add ending point"
            : ""}
        </Backdrop>
      )}
      <Grid onContextMenu={(e) => e.preventDefault()} dimension={dim}>
        {gridState.map((row, i) => {
          return (
            <Row key={i}>
              {row.map((cell, j) => {
                return (
                  <Cell
                    onClick={() => addWallMobile(i, j)}
                    w={width - 100}
                    h={height - 100}
                    dimension={dim}
                    key={j}
                    onMouseOver={(e) => addWall(e, i, j)}
                    onMouseDown={(e) => addWall(e, i, j)}
                    onTouchStart={(e) => {
                      settouchStart({
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY,
                      });
                      console.log(touchStart.x, touchStart.y);
                    }}
                    onTouchEnd={(e) => {
                      settouchEnd({
                        x: e.changedTouches[0].clientX,
                        y: e.changedTouches[0].clientY,
                      });
                      console.log(touchEnd.x, touchEnd.y);
                    }}
                    color={determineColor(
                      cell.isStart,
                      cell.isEnd,
                      cell.isWall,
                      cell.isPath,
                      cell.isVisited
                    )}
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
