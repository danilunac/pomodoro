# Pomodoro App - PRD v1

## Objetivo

Crear una aplicación web de productividad inspirada en Pomofocus que permita realizar sesiones de concentración de 25 y 50 minutos con descansos automáticos y configuración personalizable.

---

## Tecnologías

* HTML
* CSS
* JavaScript Vanilla

---

## Flujo principal

### Selección de sesión

Al abrir la aplicación el usuario debe poder elegir entre:

* Pomodoro 25 minutos
* Pomodoro 50 minutos

Una vez seleccionada una opción:

* El temporizador elegido debe mostrarse en pantalla.
* Debe quedar visualmente indicada la sesión activa.

### Temporizador

El temporizador debe incluir:

* Start
* Pause
* Reset

### Finalización de sesión

Cuando termine una sesión:

* Debe sonar una alarma suave.
* Debe iniciarse automáticamente el descanso correspondiente.

Relación entre sesiones y descansos:

* Pomodoro 25 → descanso corto de 5 minutos.
* Pomodoro 50 → descanso largo de 10 minutos.

### Finalización del descanso

Cuando termine un descanso:

* Debe sonar una alarma suave.
* El usuario debe poder iniciar una nueva sesión.

---

## Configuración

El usuario debe poder modificar:

* Volumen de la alarma.

Las configuraciones deben guardarse en localStorage.

---

## Diseño

* Responsive para móvil y escritorio.
* Diseño minimalista.
* Inspiración visual en Pomofocus.
* Modo claro.
* Modo oscuro.

---

## Restricciones técnicas

* No usar React.
* No usar backend.
* No usar bases de datos.
* Debe funcionar en GitHub Pages.
* Debe funcionar completamente offline.

---

## Criterios de éxito

* La configuración persiste al recargar la página.
* El temporizador funciona correctamente durante toda la sesión.
* Las alarmas funcionan correctamente.
* El modo claro y oscuro se conserva entre sesiones.
* La experiencia es usable tanto en móvil como en escritorio.
