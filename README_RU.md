# ZkSync Soft

Софт для автиоматизации взаимодействия с блокчейном zkSync и DeFi продуктами в нём

## Установка
`npm install`

Добавляем приватники в `private_keys.txt`

Запуск `npm start`

Настройки `config.ts`

## Модули

* SyncSwap
* Mute.io
* Maverick
* Pancake
* iZUMi (iZiSwap)
* Space.fi
* Zkswap
* Odos
* 1inch
* Openocean
* Dmail
* L2Telegraph Message
* L2Telegraph Mint and Bridge

## Особенности

* Асинхронность/Мультипоточность. Все аккаунты запускаются вместе, с рандомным временем отложенного старта
* Два режима работы. Рандом модули или кастомные модули
* Три режима аппрувов токенов. Точное кол-во, x3 от кол-ва или бесконечное кол-во
* Плотная настройка скрипта в config.ts
* Все дексы делают свап по кругу ETH −> Stable (USDC/USDT/DAI) −> ETH
* Настроены разные возможные стейблы для разных дексов исходя из ликвидности
* Использование прокси в агрегаторах свапалок (Odos, openocean, 1inch)
* Ограничение по газу в эфире. Текущий газ проверяется перед каждой транзой
* Плотное логирование всех действий в консоли + файл логов 
* В L2Telegraph входящая сеть выбирается рандомно из всех возможных, исходя из вашего ограничения по комиссии л0
* Защита от проскальзывания. Слипедж настраивается в конфиге, цена в протоколе сравнивается с ценой на бинансе. Если цена на бинансе с учетом слипеджа выше, транзакция отменяется

## Настройка

1. Вписать все приватники в private_keys.txt
2. Желательно, но необязятельно добавить хотя бы несколько прокси в proxies.txt, odos бывает банит по айпи. Прокси вида http://login:password@ip:port
3. Настроить config.ts. Внутри всё подробно расписано
4. `npm start`