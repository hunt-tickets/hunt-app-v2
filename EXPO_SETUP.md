# Configuración de Expo Go

## Pasos para conectar Expo Go a tu proyecto

### 1. Instalar Expo Go en tu celular
- **iOS**: Descargar desde App Store
- **Android**: Descargar desde Google Play Store

### 2. Comandos disponibles

#### Modo local (red WiFi)
```bash
npm start
```
- Requiere que el celular y computadora estén en la misma red WiFi
- Se abrirá una página web con código QR
- Escanea el QR con Expo Go

#### Modo túnel (si hay problemas de red)
```bash
npm run tunnel
```
- Funciona con cualquier conexión de internet
- Más lento pero más confiable

#### Plataformas específicas
```bash
npm run android    # Abre en emulador Android
npm run ios        # Abre en simulador iOS  
npm run web        # Abre en navegador web
```

### 3. Cómo conectar

1. Ejecuta `npm start` en la terminal
2. Abre Expo Go en tu celular
3. **Escanear QR**: Toca "Scan QR Code" y escanea el código
4. **O buscar en red**: Busca tu proyecto en "Development servers"

### 4. Solución de problemas

- **No aparece el proyecto**: Usar `npm run tunnel`
- **Error de red**: Verificar que estés en la misma WiFi
- **App no carga**: Verificar que las dependencias estén instaladas con `npm install`

### 5. URLs importantes

- **Metro Bundler**: http://localhost:8081
- **Expo Dev Tools**: Se abre automáticamente en el navegador

## Estado actual
✅ Dependencias instaladas  
✅ Servidor funcionando en localhost:8081  
✅ Listo para conectar Expo Go