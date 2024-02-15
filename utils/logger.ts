import {Logger} from "tslog"
import {appendFileSync} from "fs"
import {convertDateToCustomFormat} from "./common";

export function makeLogger(name: string) {
    const logger = new Logger({
        hideLogPositionForProduction: true,
        name: name,
        prettyLogTemplate: '{{dd}}.{{mm}} {{hh}}:{{MM}}:{{ss}}\t{{logLevelName}}\t{{name}}\t',
        prettyLogTimeZone: 'local',
    })

    logger.attachTransport((logObj) => {
        appendFileSync("./log.txt", `${convertDateToCustomFormat(logObj._meta.date)} ${logObj._meta.logLevelName}   ${logObj._meta.name}      ${logObj[0]}` + "\n")
    })

    return logger
}