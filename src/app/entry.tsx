import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { setLocale } from 'common/i18n/i18n'

import BackgroundClient from 'app/BackgroundClient'
import { init as initForegroundService } from 'app/ForegroundService'
import App from 'app/ui/main/App'
import { initAction, setDevicePixelRatioAction } from 'app/state/actions'
import store from 'app/state/store'

import './entry.less'

import pkgs from '../../package.json'
import { showError } from 'app/ErrorPresenter'


if (process.env.PICTURAMA_DEV_MODE) {
    document.title = 'Picturama - DEV MODE'
} else {
    document.title = `Picturama - ${pkgs.version}`
}

BackgroundClient.init()

Promise
    .all([
        BackgroundClient.fetchUiConfig(),
        BackgroundClient.fetchSettings(),
        BackgroundClient.waitForBackgroundReady(),
    ])
    .then(([ uiConfig, settings, backgroundReady ]) => {
        setLocale(uiConfig.locale)
        initForegroundService()
        store.dispatch(initAction(uiConfig, settings))

        detectDevicePixelRatioChanges()

        render(
            <Provider store={store}>
                <App/>
            </Provider>,
            document.getElementById('app'))
    })
    .catch(error => {
        showError('Initializing UI failed', error)
    })


function detectDevicePixelRatioChanges() {
    window.addEventListener('resize', updateDevicePixelRatio)
    window.matchMedia('screen and (min-resolution: 2dppx)').addListener(updateDevicePixelRatio)
}


function updateDevicePixelRatio() {
    const { devicePixelRatio } = window
    if (devicePixelRatio !== store.getState().navigation.devicePixelRatio) {
        store.dispatch(setDevicePixelRatioAction(devicePixelRatio))
    }
}
