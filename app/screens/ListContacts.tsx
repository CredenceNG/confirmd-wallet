import { ConnectionRecord, ConnectionType, DidExchangeState, useConnections } from '@adeya/ssi'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'

import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import ContactListItem from '../components/listItems/ContactListItem'
import EmptyListContacts from '../components/misc/EmptyListContacts'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ContactStackParams, Screens, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

interface ListContactsProps {
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {
  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const style = StyleSheet.create({
    list: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    itemSeparator: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      height: 1,
      marginHorizontal: 16,
    },
    descriptionContainer: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    descriptionText: {
      color: ColorPallet.grayscale.mediumGrey,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
  })
  const { records } = useConnections()
  const [store] = useStore()
  // Filter out mediator agents and connections that are not completed
  let connections: ConnectionRecord[] = records
  if (!store.preferences.developerModeEnabled) {
    connections = records.filter(
      r => !r.connectionTypes.includes(ConnectionType.Mediator) && r.state === DidExchangeState.Completed,
    )
  }

  const onPressAddContact = () => {
    navigation.getParent()?.navigate(Stacks.ConnectStack, { screen: Screens.Scan, params: { defaultToConnect: true } })
  }

  useEffect(() => {
    if (store.preferences.useConnectionInviterCapability) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderButton
            buttonLocation={ButtonLocation.Right}
            accessibilityLabel={t('Contacts.AddContact')}
            testID={testIdWithKey('AddContact')}
            onPress={onPressAddContact}
            icon="plus-circle-outline"
          />
        ),
      })
    } else {
      navigation.setOptions({
        headerRight: () => false,
      })
    }
  }, [store.preferences.useConnectionInviterCapability])

  return (
    <View>
      <View style={style.descriptionContainer}>
        <Text style={style.descriptionText}>
          Confirmed Organizations and Persons you have connected with over a secure and private line. Nothing is shared without your permission
        </Text>
      </View>
      <FlatList
        style={style.list}
        data={connections}
        ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
        keyExtractor={connection => connection.id}
        renderItem={({ item: connection }) => <ContactListItem contact={connection} navigation={navigation} />}
        ListEmptyComponent={() => <EmptyListContacts navigation={navigation} />}
      />
    </View>
  )
}

export default ListContacts
