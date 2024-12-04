import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const Dashboard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the createPage!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'black' },
});

export default Dashboard;
