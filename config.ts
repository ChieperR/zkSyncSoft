export const generalConfig = {
    // Значения в квадратных скобках указаны как [от, до]
    // Задержки указаны в секундах
    sleepBeforeWallet: [10, 15000], // Задержка перед стартом аккаунта, диапазон должен быть большим, чтобы был норм рандом между акками
    slippage: 1, // В процентах
    sleepBetweenTx: [450, 1800], // Задержка между транзакциями в разных протоколах
    sleepAfterApprove: [160, 500], // Задержка перед свапом после аппрува токена
    sleepBeforeSwapBack: [200, 550], // Задержка перед свапом обратно со стейбла на ETH
    swapEthPercent: [30, 75], // Процент эфира, подлежащий свапу
    maxTxPerRun: [2, 8], // Запусков модулей за один запуск скрипта
    // Внимание. За один запуск модуля может быть выполнено несколько транзакций. Например свапалка в среднем делает 3 транзакции. Свапы туда обратно и аппрув
    accountsPerRun: [2, 5], // Аккаунтов за один запуск скрипта
    maxGas: 40, // Максимум газа на эфире, при котором будет работать скрипт
    maxLzFee: '0.0003', // Сколько максимум эфира вы готовы отдать в l2telegraph за одну транзу
    // Внимание. Минт стоит фиксированно 0.0005 ETH и в расчёт не входит
    odosRefCode: '', // реферальный код для Odos, оставить пустым если нет
    inchApiKey: '', // Без API ключа модуль 1inch работать не будет
    // Брать API отсюда - https://portal.1inch.dev/applications

    approveMode: 2,
    // 1 - Approve exact tokens amount
    // 2 - Approve x3 from tokens amount
    // 3 - Approve unlimited
    mode: 1
    // 1 − Random modules
    // 2 - Custom modules
}

export const modulesConfig = {
    randomModules: [
        'syncswap',
        'muteio',
        'maverick',
        'pancake',
        'izumi',
        'spacefi',
        'zkswap',
        'odos',
        '1inch',
        'openocean',
        'l2telegraphMsg',
        'l2telegraphNft',
        'dmail',
    ], // Модули, используемые в рандом моде. Можно убирать и добавлять
    // Если хотите, увеличить частоту, с которой попадается тот или иной модуль, просто добавьте ещё раз его название
    customModules: [
        'dmail',
        ['l2telegraphMsg', 'l2telegraphNft'],
        'syncswap',
        ['muteio', 'odos', undefined]
    ],
    /*  Одна строчка − один шаг. Выполняется пошагово.
    Если на шаге вы хотите рандомный модуль, заключите его в квадратные скобки. Пример − шаг 2
    Если в списке рандомных модулей вы укажете undefined и рандом его выберет − шаг будет пропущен. Пример − 4  */

    /* Список всех модулей:
        'syncswap'
        'muteio'
        'maverick'
        'pancake'
        'izumi'
        'spacefi'
        'zkswap'
        'odos'
        '1inch'
        'openocean'
        'l2telegraphMsg'
        'l2telegraphNft'
        'dmail'
     */
}