import React, { useState, useEffect } from 'react';

import {
  ScrollView
} from 'react-native';
import { api } from '../../services/api';

import { Message, MessageProps } from '../Message';
import { io } from 'socket.io-client';
 
import { styles } from './styles';

let messagesQueue: MessageProps[] = [];

const socket = io(String(api.defaults.baseURL));
socket.on('new_message', (newMessage) => {
    newMessage.id = `nlwHeat-${Math.random().toString(36).slice(2)}`
    messagesQueue.push(newMessage);
})


export function MessageList(){
  const [currentMesssages, setCurrentMessages] = useState<MessageProps[]>([]);  

  useEffect(() => {
    async function fetchMessages() {
      const messagesResponse = await api.get<MessageProps[]>('/messages/last3');
      setCurrentMessages(messagesResponse.data)
    }

    fetchMessages();
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      if(messagesQueue.length > 0) {
        setCurrentMessages((prevState) => [messagesQueue[0], prevState[0], prevState[1]]);
        messagesQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps='never'
    >
      {
        currentMesssages.map(message => {
          return (
            <Message key={message.id} data={message} />
          )
        })
      }
        
    </ScrollView>
  );
}