import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Indstillinger</Text>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Notifikationer</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={(value) => setNotificationsEnabled(value)}
        />
      </View>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Mørkt tema (kommer snart)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  settingText: {
    fontSize: 18,
  },
});
