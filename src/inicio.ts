import { createApp } from 'vue'
import Aplicacion from './aplicacion/Aplicacion.vue'
import enrutador from './aplicacion/enrutador'
import '@/estilos/tokens.css'

createApp(Aplicacion).use(enrutador).mount('#app')
