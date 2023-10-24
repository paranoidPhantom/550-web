const zeroPrefix = (value: string | number) => {
    if (typeof value !== "string") value = value.toString()
    return value.length > 1 ? value : `0${value}`
}

export const useFormatedDate = (date: Date | string) => {
    if (typeof date === "string") date = new Date(date)
    return `${zeroPrefix(date.getDate())}.${zeroPrefix(date.getMonth())}.${zeroPrefix(date.getFullYear())}`
}