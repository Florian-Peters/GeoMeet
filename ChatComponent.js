import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';

const ChatComponent = ({
  selectedUser,
  chatInput,
  setChatInput,
  onSendMessage,
  onToggleChat,
  receivedMessages,
  sentMessages,
}) => {
  const allMessages = [...receivedMessages, ...sentMessages];
  const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp); // Sort messages by timestamp

  return (
    <View style={{ flex: 0.5, backgroundColor: '#333333', padding: 10 }}>
      <TouchableOpacity onPress={onToggleChat}>
        <Text>Zurück</Text>
      </TouchableOpacity>
      <FlatList
        data={sortedMessages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, alignSelf: item.sender === selectedUser.username ? 'flex-end' : 'flex-start' }}>
            <View style={{ 
              backgroundColor: item.sender === selectedUser.username ? 'green' : 'blue', 
              borderRadius: 10, 
              padding: 10, 
              maxWidth: '80%',
              alignSelf: item.sender === selectedUser.username ? 'flex-end' : 'flex-start'
            }}>
              <Text style={{ fontSize: 16, color: 'white' }}>
                {item.sender === selectedUser.username ? selectedUser.username  : `${item.sender}: `}
              </Text>
              <Text style={{ color: 'white' }}>{item.message}</Text>
            </View>
            <Text style={{ alignSelf: 'flex-end', fontSize: 10 }}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextInput
          style={{ flex: 1, height: 40, borderColor: 'black', borderWidth: 2, paddingLeft: 15, paddingRight: 15 }}
          placeholder={`Nachricht an ${selectedUser.username}`}
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => onSendMessage(chatInput)}>
          <Text>Senden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatComponent;
