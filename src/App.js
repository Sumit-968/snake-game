import Board from './Board/Board.js';
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => (
  
    <Board/>
  
);

export default App;
/*
<Fragment>
  <Modal
    centered
    size="sm"
    isOpen={isOpen}
  >
    <ModalHeader >
     Welcome to the SNAKEGAME!!
    </ModalHeader>
    <ModalBody>
<input required={true} type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)}/>
      <Button
        color="primary"
        size="sm"
        className="mx-2 mb-1"
        onClick={() =>  {
          localStorage.setItem("name", name);
          setIsOpen(false);
        }}
      >
        Start
      </Button>
    </ModalBody>
    
  </Modal>


  
      <div className="fixedheaderss">
        <h3>
          Score: {score} HighScore: {highscore}
        </h3>
      </div>
      
       <div className="boardss main-colss">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="rowss">
            {row.map((cellValue, cellIdx) => {
              const className = getCellClassName(
                cellValue,
                foodCell,
                foodShouldReverseDirection,
                snakeCells
              );
              return <div key={cellIdx} className={className}></div>;
            })}
          </div>
        ))}
    </div>

      <div className="gridss">
        <div></div>
        <div>
          <BsFillArrowUpSquareFill
            className="buttonss"
            onClick={() => handleKeydown(up)}
          />
        </div>
        <div></div>
        <div>
          <BsFillArrowLeftSquareFill
            className="buttonss"
            onClick={() => handleKeydown(left)}
          />
        </div>
        <div>
        {gameOver && <BsArrowRepeat
        className="buttonss"
            onClick={() => resetGame()}
        />}
        </div>
        <div>
          <BsFillArrowRightSquareFill
            className="buttonss"
            onClick={() => handleKeydown(right)}
          />
        </div>
        <div></div>
        <div>
          <BsFillArrowDownSquareFill
            className="buttonss"
            onClick={() => handleKeydown(down)}
          />
        </div>
        <div></div>
      </div>
      <div className="fixedfooterss">
        <h4>
          Snake: <BsFillSquareFill style={{ color: "green" }} /> Food:{" "}
          <BsFillSquareFill style={{ color: "red" }} /> Poison*:{" "}
          <BsFillSquareFill style={{ color: "purple" }} />
          <br />
          Note* : Poison reverse the direction of snake
        </h4>
      </div>
    </Fragment>
*/
