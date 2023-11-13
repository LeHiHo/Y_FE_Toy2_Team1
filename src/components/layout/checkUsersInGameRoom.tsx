import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { onlineUserStateInGameRoom } from '../../states/atom';
import { io } from 'socket.io-client';
import { SERVER_URL, SERVER_ID } from '../../constant';
import { getUserData } from '../../api';
import UserProfile from '../template/userProfile';
import { getCookie } from '../../util/util';
import styled from 'styled-components';

interface ChattingDetailProps {
  chatId: string;
}

type ResponseValue = {
  user: User;
};

interface User {
  id: string;
  name: string;
  picture: string;
}

const CheckUsersInGameRoom: React.FC<ChattingDetailProps> = ({ chatId }) => {
  const UsersInGameRoom = useRecoilValue(onlineUserStateInGameRoom);
  const [profiles, setProfiles] = useState<ResponseValue[]>([]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const profilesArray: ResponseValue[] = [];
      // console.log(UsersInGameRoom);
      for (const userId of UsersInGameRoom) {
        // console.log(userId);
        // if (userId.substring(0, 8) === '090b4ff4') {
        //   console.log(userId.substring(0, 9));
        //   const id = userId.substring(9);
        //   try {
        //     const res = await getUserData(id);
        //     profilesArray.push(res);
        //   } catch (error) {
        //     console.error('Error fetching user data:', error);
        //   }
        // } else {
        try {
          const res = await getUserData(userId);
          profilesArray.push(res);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        // }
      }

      setProfiles(profilesArray);
    };

    fetchUserProfiles();
  }, [UsersInGameRoom, setProfiles]);
  console.log(profiles);
  return (
    <UserList>
      {profiles.map((element, index) => (
        <div key={index}>
          <UserBox>
            <ImgBox>
              <UserImage src={element.user.picture} alt="profileImg" />
            </ImgBox>

            <TextBox>
              <UserId>{element.user.id}</UserId>
              <UserNick>{element.user.name}</UserNick>
            </TextBox>
          </UserBox>
        </div>
      ))}
    </UserList>
  );
};

const UserList = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserId = styled.div`
  color: #2d3748;
  font-size: 18px;
`;

const UserNick = styled.div`
  color: #a0aec0;
  font-size: 14px;
`;

const UserBox = styled.div`
  width: 285px;
  height: 110px;
  background-color: #fff;
  display: flex;
  align-items: center;
  border-radius: 10px;
  box-shadow: 0px 3px 5px 0px #e2e8f0;

  &[id='painter'] {
    background-image: linear-gradient(90deg, #313860 10%, #151928 90%);

    ${UserId} {
      color: #fff;
    }

    ${UserNick} {
      color: #cbd5e0;
    }
  }
`;

const ImgBox = styled.div`
  width: 70px;
  height: 70px;
  margin-left: 20px;
`;

const UserImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const TextBox = styled.div`
  margin-left: 20px;
  font-weight: 700;
`;

export default CheckUsersInGameRoom;
