import { useNavigation } from '@react-navigation/core'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Vibration, View, StyleSheet, Text } from 'react-native'
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { QrCodeScanError } from '../../types/error'

import QRScannerClose from './QRScannerClose'
import QRScannerTorch from './QRScannerTorch'

interface Props {
  handleCodeScan: (data: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
}

const CameraViewContainer: React.FC<{ portrait: boolean; children: React.ReactNode }> = ({ portrait, children }) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: portrait ? 'column' : 'row',
        alignItems: 'center',
      }}>
      {children}
    </View>
  )
}

const QRScanner: React.FC<Props> = ({ handleCodeScan, error, enableCameraOnError }) => {
  const navigation = useNavigation()
  const [cameraActive, setCameraActive] = useState(true)
  const [torchActive, setTorchActive] = useState(false)
  const { t } = useTranslation()
  const invalidQrCodes = new Set<string>()
  const { ColorPallet, TextTheme } = useTheme()

  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.grayscale.black,
    },
    overlay: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      alignItems: 'flex-start',
    },
    footer: {
      paddingBottom: 50,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    viewFinder: {
      width: 280,
      height: 280,
      borderRadius: 20,
      borderWidth: 6,
      borderColor: '#00FF00',
      backgroundColor: 'rgba(0, 255, 0, 0.1)',
      borderStyle: 'solid',
      shadowColor: '#00FF00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 10,
    },
    viewFinderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    icon: {
      color: ColorPallet.grayscale.white,
      padding: 4,
    },
    corner: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderColor: '#FFFFFF',
      borderWidth: 5,
    },
    topLeft: {
      top: -2,
      left: -2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    topRight: {
      top: -2,
      right: -2,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
    },
    bottomLeft: {
      bottom: -2,
      left: -2,
      borderRightWidth: 0,
      borderTopWidth: 0,
    },
    bottomRight: {
      bottom: -2,
      right: -2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
    },
    overlayContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    topOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    bottomOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    middleRow: {
      flexDirection: 'row',
      height: 280,
    },
    leftOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    rightOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    scanningArea: {
      width: 280,
      height: 280,
      backgroundColor: 'transparent',
    },
    uiOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  useEffect(() => {
    if (!hasPermission) {
      requestPermission()
    }
  }, [hasPermission, requestPermission])

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (!cameraActive || codes.length === 0) return

      const code = codes[0]
      if (!code?.value) return

      if (invalidQrCodes.has(code.value)) {
        return
      }
      if (error?.data === code.value) {
        invalidQrCodes.add(error.data!)
        if (enableCameraOnError) {
          return setCameraActive(true)
        }
      }

      Vibration.vibrate()
      handleCodeScan(code.value)
      setCameraActive(false)
    },
  })


  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={[TextTheme.caption, { color: ColorPallet.grayscale.white }]}>
          {t('QRScanner.PermissionToUseCamera')}
        </Text>
      </View>
    )
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={[TextTheme.caption, { color: ColorPallet.grayscale.white }]}>
          {t('QRScanner.CameraNotAvailable')}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.container}
        device={device}
        isActive={cameraActive}
        torch={torchActive ? 'on' : 'off'}
        codeScanner={codeScanner}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <QRScannerClose onPress={() => navigation.goBack()} />
            <View style={styles.errorContainer}>
              {error ? (
                <>
                  <Icon style={styles.icon} name="cancel" size={30} />
                  <Text style={[TextTheme.caption, { color: ColorPallet.grayscale.white }]}>{error.message}</Text>
                </>
              ) : (
                <Text style={[TextTheme.caption, { color: ColorPallet.grayscale.white, height: 30, margin: 4 }]}> </Text>
              )}
            </View>
          </View>
          
          {/* Dark overlay mask with hole for scanning */}
          <View style={styles.overlayContainer} pointerEvents="none">
            {/* Top dark area */}
            <View style={styles.topOverlay} />
            
            {/* Middle row with left/right dark areas and center hole */}
            <View style={styles.middleRow}>
              <View style={styles.leftOverlay} />
              <View style={styles.scanningArea} />
              <View style={styles.rightOverlay} />
            </View>
            
            {/* Bottom dark area */}
            <View style={styles.bottomOverlay} />
          </View>
          
          {/* Scanning frame and UI overlaid on top */}
          <View style={styles.uiOverlay} pointerEvents="box-none">
            <View style={styles.viewFinderContainer}>
              <View style={styles.viewFinder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={[TextTheme.caption, { color: ColorPallet.grayscale.white, textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: 'bold' }]}>
                {t('QRScanner.ScanInstruction')}
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
          </View>
        </View>
      </Camera>
    </View>
  )
}

export default QRScanner
