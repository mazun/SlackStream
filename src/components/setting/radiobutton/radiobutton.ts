export interface RadioButtonChoice {
    id: string;
    value: string;
}

export interface RadioButton {
    choices: RadioButtonChoice[];
    name: string;
    title: string;
    selected: string;
}

export class RadioButtonFactory {
    static get(title: string, choiceValues: string[], defaultValue: string): RadioButton {
        let button = {} as RadioButton;

        if (choiceValues.indexOf(defaultValue) < 0) {
            throw 'defaultValue is invalid';
        }

        button.name = title.replace(/ /g, '_');
        button.title = title;
        button.choices = [];
        button.selected = defaultValue;
        for (const choiceValue of choiceValues) {
            let choice = {} as RadioButtonChoice;
            choice.value = choiceValue;
            choice.id = button.name + '_' + choice.value;
            button.choices.push(choice);
        }

        return button;
    }
}
