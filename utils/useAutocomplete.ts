const comesAfter = (input: string, index: number, prefix: string | undefined) => {
    if (prefix === undefined && index === 0) return undefined
    const res = input.slice(index - (prefix ? prefix.length : 1), index)
    return res === prefix
}

export interface completionField {
    name: string;
    key: string;
    type: "input" | "textarea";
}

export interface completion {
    icon: string;
    title: string;
    prefix: string;
    button?: string;
    fields?: completionField[];
    runner: Function;
}

export interface runnerFields {
    [key: string]: any
}

const prefixBasedCompletions: completion[] = [
    {
        icon: "lucide:heading-1",
        title: "Создать заголовок",
        prefix: `\n`,
        button: "Создать",
        fields: [
            {
                name: "Заголовок",
                type: "input",
                key: "heading"
            },
            {
                name: "Тип заголовка от 1-6 (H1-H6)",
                type: "input",
                key: "size"
            }
        ],
        runner: (fields: runnerFields) => {
            return `${"#".repeat(fields.size)} ${fields["heading"] as string}`
        }
    },
    {
        icon: "lucide:list",
        title: "Создать список",
        prefix: `\n`,
        button: "Создать",
        fields: [
            {
                name: "Каждый пункт на отдельной строке",
                type: "textarea",
                key: "list"
            }
        ],
        runner: (fields: runnerFields) => {
            const listString = fields["list"] as string
            const list = listString.split("\n")
            return  `- ${list.join("\n- ")}`
        }
    },
    {
        icon: "lucide:list-ordered",
        title: "Создать нумерованный список",
        prefix: `\n`,
        button: "Создать",
        fields: [
            {
                name: "Каждый пункт на отдельной строке",
                type: "textarea",
                key: "list"
            }
        ],
        runner: (fields: runnerFields) => {
            const listString = fields["list"] as string
            const list = listString.split("\n")
            let result = ``
            list.forEach((item, index) => {
                result = `${result}${index > 0 ? "\n" : ""}${index + 1}. ${item}`
            })
            return result
        }
    },
    {
        icon: "lucide:link",
        title: "Вставить ссылку",
        prefix: `\n`,
        button: "Создать",
        fields: [
            {
                name: "Текст",
                type: "input",
                key: "text"
            },
            {
                name: "Ссылка",
                type: "input",
                key: "link"
            }
        ],
        runner: (fields: runnerFields) => {
            return `[${fields.text}](${fields.link})`
        }
    }
]

export const useAutocomplete = (input: string, index: number) => {
    if (!input && !(input === "")) { return }
    const completionsMatched: completion[] = []
    prefixBasedCompletions.forEach((completion) => {
        if (comesAfter(input, index, completion.prefix) || (completion.prefix === "\n" && comesAfter(input, index, undefined) === undefined)) completionsMatched.push(completion)
    })
    return completionsMatched
}