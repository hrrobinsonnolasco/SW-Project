# BRIEF TÉCNICO: Clon de Compartición de Pantalla P2P (MVP)

## 1. Resumen de la Idea y Objetivo

Desarrollar una aplicación web ligera enfocada en compartir en tiempo real la pantalla o una ventana específica del PC (por ejemplo, reproductores multimedia locales como VLC) mediante la generación de un enlace único. El receptor debe ser capaz de consumir la transmisión en vivo desde cualquier dispositivo móvil o de escritorio de forma inmediata al abrir el enlace, sin registros ni fricciones adicionales.

## 2. Stack Tecnológico Definitivo

- **Frontend:** React (inicializado con Vite) + Tailwind CSS para la maquetación.
- **Backend:** Node.js con Express y Socket.io encargado exclusivamente de la señalización (signaling).
- **Protocolo de Media:** WebRTC (Peer-to-Peer directo) mediante las APIs nativas del navegador (`navigator.mediaDevices.getDisplayMedia`).
- **Infraestructura de Red:** Servidores STUN públicos (Google) y credenciales TURN listas para integrar (Twilio / Xirsys) en entornos restringidos.
- **Despliegue:** Vercel (Frontend) y Render o Railway (Backend).



## 3. Checklist de Tareas por Fase



### Fase 1: Setup y Arquitectura Base

- [x] Inicializar repositorio de Git y configurar entorno con Vite + React + Tailwind CSS.
- [x] Crear servidor básico Node.js con Express y configurar Socket.io para comunicación bidireccional local.
- [x] Configurar políticas de CORS en el servidor para permitir peticiones desde el origen del Frontend.
- [x] Maquetar la interfaz del Emisor (Panel de control, botón de inicio, sección para copiar link).
- [x] Maquetar la interfaz del Receptor (Reproductor de video limpio con tag `<video>`).



### Fase 2: Captura y Lógica de Señalización

- [x] Implementar la API `getDisplayMedia` en el cliente del Emisor para capturar la ventana/pantalla con audio del sistema activo.
- [x] Desarrollar la lógica de creación de "salas" asíncronas en el servidor mediante Socket.io (`/stream/:id`).
- [x] Programar el intercambio de ofertas y respuestas SDP (Session Description Protocol) entre Emisor y Receptor a través de WebSockets.
- [x] Programar el intercambio de candidatos ICE (Interactive Connectivity Establishment) en tiempo real para el descubrimiento de red.



### Fase 3: Transmisión y Estabilidad WebRTC

- [x] Conectar el flujo multimedia (`MediaStream`) entrante al elemento `<video>` del Receptor.
- [x] Ajustar los constraints de WebRTC en el emisor para optimizar la transmisión de audio del sistema (desactivar `echoCancellation` y `noiseSuppression` para fidelidad de películas).
- [x] Configurar la lista de servidores `iceServers` (STUN/TURN) en la configuración de `RTCPeerConnection`.
- [x] Implementar eventos de limpieza: si el Emisor cierra la ventana o desconecta el flujo, destruir la conexión remota y notificar al Receptor.



### Fase 4: Despliegue en Producción

- [x] Configurar variables de entorno en el Frontend para apuntar dinámicamente a la URL de producción del servidor.
- [ ] Desplegar el Backend de Node.js en Render/Railway.
- [ ] Desplegar el Frontend en Vercel y verificar la conexión P2P usando datos móviles en el dispositivo receptor.



## 4. Convenciones y Restricciones a Respetar

- **Keep It Simple:** No agregar sistemas de autenticación, pasarelas de pago, bases de datos persistentes ni chats de texto. El alcance está estrictamente cerrado a la transmisión multimedia.
- **Arquitectura:** Mantener el flujo de video en Peer-to-Peer. El servidor Node.js no debe procesar, almacenar ni retransmitir video; actúa únicamente como puente de señalización inicial.
- **Código Limpio:** Separar la lógica de hooks de WebRTC de los componentes visuales de React.



## 5. Definición de "Hecho" (Definition of Done) para el MVP

El MVP se considerará finalizado cuando un usuario emisor en Windows pueda seleccionar una ventana en reproducción local, generar un enlace, enviarlo por una app de mensajería, y un usuario receptor en un dispositivo móvil (4G/Wi-Fi externo) pueda hacer clic en el link y ver y escuchar la transmisión con latencia mínima y sincronizada.