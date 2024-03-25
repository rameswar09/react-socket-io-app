import { useEffect, Fragment, useState, useRef } from "react";
import { Box, TextInput, Select, FormField, Button, Text } from "grommet";
import "./App.css";
import { io } from "socket.io-client";
const socket = io("http://localhost:8000");
let timer;
function App() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [levelSel, setLevelSel] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [currentPoint, setCurrentPoint] = useState("");
  const [roomUsers, setRoomUsers] = useState([]);
  const [roomWinners, setRoomWinners] = useState([]);
  const [butDis, setButDis] = useState(false);
  const [userData, setUserData] = useState({});
  const totalMoneyRef = useRef(0);
  const totalPointsRef = useRef(0);
  const entryPointsRef = useRef(0);
  const entryFeeRef = useRef(0);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });
    socket.on("test", () => {
      console.log(socket.id);
    });

    socket.on("helloClient", () => {
      console.log("hello from the server");
    });

    socket.on("new-users", (args) => {
      setRoomUsers(args);
    });
    socket.on("TICKER_DATA", (args) => {
      setRoomWinners(args);
    });

    return () => {
      socket.emit("disconnect", userData.level);
    };
  }, []);

  const handleSubmit = () => {
    setButDis(true);
    let obj = {
      name: name,
      userId: userId.toString(),
      level: levelSel,
      entryFee: entryFee,
      entryPoints: currentPoint,
      totalMoney: entryFee,
      currentPoint: currentPoint,
    };
    totalMoneyRef.current = parseInt(entryFee);
    totalPointsRef.current = parseInt(currentPoint);
    entryPointsRef.current = parseInt(currentPoint);
    entryFeeRef.current = parseInt(entryFee);
    setUserData(obj);
    timer = setInterval(() => {
      let currentPoint = totalPointsRef.current;
      currentPoint = currentPoint + Math.floor(Math.random() * 10000);
      let extraMoney = Math.floor((currentPoint - entryPointsRef.current) / 10);
      let totalMoney = entryFeeRef.current + extraMoney;
      totalMoneyRef.current = totalMoney;
      totalPointsRef.current = currentPoint;
      setUserData({
        ...obj,
        totalMoney: totalMoney.toString(),
        currentPoint: currentPoint.toString(),
      });
    }, 5000);
    setName("");
    setUserId("");
    setLevelSel("");
    setEntryFee("");
    setCurrentPoint("");

    socket.emit("join-room", [obj, socket.id]);
  };

  const handleEndGame = () => {
    if (timer) {
      clearInterval(timer);
    }
    socket.emit("GAME_END", { ...userData, endTime: Date.now().toString() });
  };

  const users = roomUsers.map((each) => {
    return (
      <FormField
        name="Users In This Room"
        htmlFor="text-input-id"
        label="Users In This Room"
      >
        <TextInput value={each.name} />
      </FormField>
    );
  });
  const winners = roomWinners[0]
    ? roomWinners[0].messages.map((each) => {
        let timeDiff = Math.floor(
          (new Date(Date.now()) - new Date(parseInt(each.message.endTime))) /
            1000 /
            60
        );
        let won = parseInt(each.message.totalMoney)- parseInt(each.message.entryFee)
        let times = Math.floor(won/each.message.entryFee)
        return (
          <Box margin="small"  pad ="medium"background="#f2f2f2">
            <Text>{`Name - ${each.message.name}:${each.message.userId}`}</Text>
            <Text>{`Entry - ${each.message.entryFee}`}</Text>
            <Text>{`Total Money - ${each.message.totalMoney}`}</Text>
            <Text>{`Won - ${won}(${times}x)`}</Text>
            <Text>{`Total Points - ${each.message.currentPoint}`}</Text>
            <Text>{`${timeDiff} min ago`}</Text>
          </Box>
        );
      })
    : [];
  return (
    <Fragment>
      <Box gap="medium" pad="medium" elevation="small" margin="medium">
        <FormField name="name" htmlFor="text-input-id" label="Name">
          <TextInput
            placeholder="Type your Name"
            value={name}
            onChange={(e) => {
              setUserId(Math.floor(Math.random() * Date.now()));
              setName(e.target.value);
            }}
          />
        </FormField>
        <FormField name="UserId" htmlFor="text-input-id" label="User ID">
          <TextInput
            placeholder="Type userId"
            value={userId}
            // onChange={(e) => setUserId(e.target.value)}
          />
        </FormField>

        <FormField name="Level" htmlFor="text-input-id" label="Level">
          <Select
            options={["beginner", "advanced", "intermediate"]}
            placeholder="Select your level"
            value={levelSel}
            onChange={({ option }) => setLevelSel(option)}
          />
        </FormField>

        <FormField name="Entryfee" htmlFor="text-input-id" label="Entry fee">
          <TextInput
            placeholder="Type your Entry fee"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
          />
        </FormField>
        <FormField
          name="CurrentPoints"
          htmlFor="text-input-id"
          label="Current Points"
        >
          <TextInput
            placeholder="Type your Current Points"
            value={currentPoint}
            onChange={(e) => setCurrentPoint(e.target.value)}
          />
        </FormField>

        <Button disabled={butDis} label="Start Game" onClick={handleSubmit} />
      </Box>
      {butDis ? (
        <Box margin="medium" pad="medium" elevation="medium">
          <FormField name="User Name" htmlFor="text-input-id" label="User Name">
            <TextInput value={userData.name} />
          </FormField>
          <FormField name="User Id" htmlFor="text-input-id" label="User ID">
            <TextInput value={userData.userId} />
          </FormField>
          <FormField
            name="User Level"
            htmlFor="text-input-id"
            label="User Level"
          >
            <TextInput value={userData.level} />
          </FormField>
          <FormField
            name="User Entry Fee"
            htmlFor="text-input-id"
            label="User Entry Fee"
          >
            <TextInput value={userData.entryFee} />
          </FormField>
          <FormField
            name="User starting points"
            htmlFor="text-input-id"
            label="User starting points"
          >
            <TextInput value={userData.entryPoints} />
          </FormField>
          <FormField
            name="User Total Money"
            htmlFor="text-input-id"
            label="Total Money"
          >
            <TextInput value={userData.totalMoney} color="green" />
          </FormField>
          <FormField
            name="User Total Points"
            htmlFor="text-input-id"
            label="Total Points"
          >
            <TextInput value={userData.currentPoint} color="green" />
          </FormField>
          <Button label="End Game" onClick={handleEndGame} />
        </Box>
      ) : null}

      <Box margin="medium" pad="medium" elevation="medium" background="#FF7F50">
        {users}
      </Box>
      <Box margin="medium" pad="medium" elevation="medium" background="#99ccff">
        {winners}
      </Box>
    </Fragment>
  );
}

export default App;
