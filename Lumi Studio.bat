@echo off
title Lumi Studio
cd /d "%~dp0lumi-studio"
node server.mjs --open
if errorlevel 1 pause
