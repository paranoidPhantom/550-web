const zeroPrefix = (value: string | number) => {
    if (typeof value !== "string") value = value.toString()
    return value.length > 1 ? value : `0${value}`
}

export const useFormatedDate = (date: Date | string, withTime?: boolean) => {
    if (typeof date === "string") date = new Date(date)
    const time = `${zeroPrefix(date.getHours())}:${zeroPrefix(date.getMinutes())}`
    return `${zeroPrefix(date.getDate())}.${zeroPrefix(date.getMonth() + 1)}.${zeroPrefix(date.getFullYear())}${withTime ? ' '+time : ''}`
}