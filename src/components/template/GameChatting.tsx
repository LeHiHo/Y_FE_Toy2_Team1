import styled from 'styled-components';
import InfoImg from '../../assets/icons/info.png';
import AaImg from '../../assets/icons/Aa.png';
import sendImg from '../../assets/icons/send.png';
import { useEffect, useState } from 'react';
import { chatSocket } from '../../api/socket';
import {
  sortCreatedAt,
  createSeparatedTime,
  modifyDate,
} from './useChattingSort';
import { useRecoilState } from 'recoil';
import {
  privateChatDetail,
  privateChatNew,
  onlineUserStateInGameRoom,
} from '../../states/atom';
import { getCookie } from '../../util/util';

interface ChattingDetailProps {
  chatId: string;
}

interface ChatsProps {
  mine: boolean; // 이 부분이 추가되었습니다.
}

const GameChatting = ({ chatId }: ChattingDetailProps) => {
  const [postData, setPostData] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [fetchChat, setFetchChat] = useRecoilState(privateChatDetail);
  const [newChat, setNewChat] = useRecoilState(privateChatNew);
  const [__, setUsersInGameRoom] = useRecoilState<string[]>(
    onlineUserStateInGameRoom,
  );
  const [lastDate, setLastDate] = useState<string | undefined>('');
  const accessToken: any = getCookie('accessToken');

  const myUserId = localStorage.getItem('id');
  console.log(myUserId);

  useEffect(() => {
    try {
      const newSocket = chatSocket(accessToken, chatId);
      setSocket(newSocket);

      newSocket.on('messages-to-client', (messageData) => {
        console.log('Fetched messages:', messageData.messages);

        // createdAt을 기준으로 시간순서 정렬
        const sortedMessages = sortCreatedAt(messageData.messages);

        // createdAt을 날짜와 시간으로 분리
        const SeparatedTime: any = sortedMessages.map((message) => ({
          ...message,
          ...createSeparatedTime(message.createdAt),
        }));

        // 마지막 날짜 저장
        setLastDate(SeparatedTime[SeparatedTime.length - 1]?.date);

        // 중복 날짜, 시간 null로 반환
        const modifyDateArray = modifyDate(SeparatedTime);

        setFetchChat(modifyDateArray);
      });

      newSocket.on('message-to-client', (messageObject) => {
        console.log(messageObject);
        setNewChat((newChat: any) => {
          // 중복 날짜, 시간 null로 반환
          const modifyDateArray = modifyDate([
            ...newChat,
            {
              ...messageObject,
              ...createSeparatedTime(messageObject.createdAt),
            },
          ]);
          return modifyDateArray;
        });
      });

      // 게임방 유저 목록 소켓 연결
      newSocket.on('connect', () => {
        socket.emit('users');
      });

      newSocket.on('users-to-client', (data) => {
        setUsersInGameRoom(data.users);
      });

      newSocket.on('join', (data) => {
        console.log('들어온거 작동');
        setUsersInGameRoom(data.users);
      });

      newSocket.on('leave', (data) => {
        console.log('나간거 작동');
        setUsersInGameRoom(data.users);
      });

      return () => {
        setNewChat([]);
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  }, [accessToken, chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData(e.target.value);
  };

  const messageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('message-to-server', postData);
    setPostData('');
  };

  console.log(myUserId);

  return (
    <Chat>
      <ChatHeader>
        <ChatHeaderIcon src={InfoImg} alt="ChatInfo" />
        <ChatHeaderWarn>게임이 시작되었습니다.</ChatHeaderWarn>
      </ChatHeader>
      <Chatting>
        {/* 이전 채팅 불러오기 */}
        {fetchChat.map((element, index) => (
          <div key={index}>
            <p>{element.date}</p>
            <ChatWrap mine={element.userId === myUserId}>
              <Chats mine={element.userId === myUserId}>
                <p>{element.text}</p>
                <ChatTime mine={element.userId === myUserId}>
                  {element.time}
                </ChatTime>
              </Chats>
            </ChatWrap>
          </div>
        ))}

        {/* 현재 채팅 */}
        {newChat.map((element, index) => (
          <div key={index}>
            {element.date !== lastDate && <p>{element.date}</p>}

            <ChatWrap mine={element.userId === myUserId} id="messageWrap">
              <Chats mine={element.userId === myUserId}>
                <p>{element.text}</p>
                <ChatTime mine={element.userId === myUserId}>
                  {element.time}
                </ChatTime>
              </Chats>
            </ChatWrap>
          </div>
        ))}
      </Chatting>
      <SendChat>
        <form onSubmit={messageSubmit}>
          <SendInput
            type="text"
            placeholder="Aa"
            value={postData}
            onChange={handleInputChange}
          />
          <SendBtn>
            <Sending src={sendImg} alt="send" />
          </SendBtn>
        </form>
      </SendChat>
    </Chat>
  );
};

const Chat = styled.div`
  width: 450px;
  height: 563px;
  background-color: #fff;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0px 3px 5px 0px #e2e8f0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const ChatHeader = styled.div`
  width: 100%;
  height: 50px;
  background-image: linear-gradient(90deg, #313860 20%, #151928 80%);
  border-radius: 15px 15px 0 0;
  position: relative;
`;

const ChatHeaderIcon = styled.img`
  position: absolute;
  top: 11px;
  left: 96px;
`;

const ChatHeaderWarn = styled.div`
  position: absolute;
  top: 12px;
  left: 130px;
  color: #fff;
`;

const SendChat = styled.div`
  position: relative;
`;

const Chatting = styled.div`
  width: 450px;
  height: 463px;
  margin: 0 auto;
  background-color: #fff;
  overflow-y: scroll;
  padding: 20px;

  /* ::-webkit-scrollbar {
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #b1bfd8;
  } */
  //스크롤바 일단 보류...
`;

const ChatWrap = styled.div<ChatsProps>`
  width: 100%;
  text-align: ${(props) => (props.mine ? 'right' : 'left')};
  position: relative;
`;

const Chats = styled.div<ChatsProps>`
  max-width: 260px;
  padding: 8px 12px;
  border-radius: 18px;
  color: white;
  font-size: 14px;

  background-color: ${(props) => (props.mine ? '#4FD1C5' : '#EDF2F7')};
  color: ${(props) => (props.mine ? '#fff' : '#2D3748')};
  margin-bottom: 10px;
  display: inline-block;
  text-align: ${(props) => (props.mine ? 'right' : 'left')};
`;

const ChatTime = styled.div<ChatsProps>`
  font-size: 10px;
  color: ${(props) =>
    props.mine ? 'rgba(255, 255, 255, 0.7)' : 'rgba(45,55,72, 0.7)'};
  //시간 부분도 똑같이 구현 못 함...
`;

const SendInput = styled.input`
  padding-left: 25px;
  width: 450px;
  height: 50px;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 10px 10px;

  &:focus {
    border-color: #c2c5ca;
    outline: none;
  }
`;

const SendBtn = styled.button``;

const Sending = styled.img`
  position: absolute;
  top: 8px;
  right: 10px;
  width: 30px;
  height: 30px;
`;

export default GameChatting;
