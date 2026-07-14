@echo off
setlocal
set "ROOT=%~dp0"
set "HTML=%ROOT%habit-gestor.html"

if not exist "%HTML%" (
  echo No se encontro habit-gestor.html.
  exit /b 1
)

start "" "%HTML%"
echo Se abrio el gestor de hábitos.
endlocal
