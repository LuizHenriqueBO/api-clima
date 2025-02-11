# Documentação do Projeto

Este projeto é uma API que disponibiliza dados de usuários armazenados em banco de dados local e também coleta e disponibiliza dados sobre estados, cidades e informações climáticas de uma cidade.

## Configuração
Antes de rodar o projeto é necessário criar o banco de dados
```sql
CREATE DATABASE appmoove;
use appmoove;

CREATE TABLE appmoove.users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT null
);
```

* Acesse o projeto loadCSV para preencher os dados no banco de dados
* OBS: coloca o arquivo CSV dos dados de usuários no diretório backup e com o nome users.csv

```sh
# Acesse o projeto
cd loadCSV

# Instala as dependências
yarn install

# Executa o projeto para adicionar os dados no banco de dados
yarn start
```

## Variáveis de ambiente

```sh
DATABASE_URL="mysql://root@localhost:3306/appmoove?schema=appmoove"
WEATHER_API_KEY="WEATHER_KEY"
```


## Instalação e execução da API
Segue os seguintes passos para executar o projeto em sua máquina local:


1. **Instalando as dependências**
    ```sh
        yarn install
    ```

2. **Gerando o Prisma client**
    ```sh
        npx prisma generate
    ```

3. **Gerando o Prisma client**

    ```sh
        yarn dev
    ```