ECHO OFF
C:
cd C:\WindowsFirebird\ServiceFirebird\
cls
echo "Instalando dependencias do serviço"
call node\npm install 
cls 
echo "Insira informação do certificado"
call node\node registro.js
cls
echo "Instalando o serviço no windows"
call node\node service.js
cls

echo "FIM DA INSTALACAO"
pause