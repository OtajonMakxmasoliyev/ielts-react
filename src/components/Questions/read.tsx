import React, { createContext, useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useDropzone } from "react-dropzone";
import remarkGfm from "remark-gfm";


interface CheckboxGroupContextType {
    selected: string[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextType | null>(
    null
);

function useCheckboxLimit(name: string, min: number, max: number) {
    const [selected, setSelected] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newSelected = [...selected];

        if (e.target.checked) {
            if (newSelected.length < max) {
                newSelected.push(e.target.value);
            } else {
                e.target.checked = false; // limitdan oshmasin
            }
        } else {
            newSelected = newSelected.filter((v) => v !== e.target.value);
        }

        setSelected(newSelected);
    };

    return { selected, handleChange };
}

// =======================
// CheckboxGroup Component
// =======================
interface CheckboxGroupProps {
    name: string;
    min?: number;
    max?: number;
    children: React.ReactNode;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
    name,
    min = 0,
    max = 2,
    children,
}) => {
    const { selected, handleChange } = useCheckboxLimit(name, min, max);

    return (
        <CheckboxGroupContext.Provider value={{ selected, handleChange }}>
            <div>{children}</div>
        </CheckboxGroupContext.Provider>
    );
};

// =======================
// Checkbox Component
// =======================
interface CheckboxProps {
    name: string;
    value: string;
    children: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, value, children }) => {
    const ctx = useContext(CheckboxGroupContext);

    if (!ctx) {
        throw new Error("Checkbox must be used inside a CheckboxGroup");
    }

    const { handleChange } = ctx;

    return (
        <label className="block cursor-pointer">
            <input
                type="checkbox"
                name={name}
                value={value}
                onChange={handleChange}
                className="mr-2"
            />
            {children}
        </label>
    );
}
// Radio Props
interface RadioProps {
    name: string;
    value: string;
    children?: React.ReactNode;
}

const Radio: React.FC<RadioProps> = ({ name, value, children }) => {
    return (
        <label className="block cursor-pointer">
            <input type="radio" name={name} value={value} className="mr-2" />
            {children}
        </label>
    );
};

// Dropzone Props
interface DropzoneProps {
    name: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ name }) => {
    const onDrop = (files: File[]) => console.log("Uploaded:", files);
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()} className="p-4 border-2 border-dashed rounded">
            <input {...getInputProps()} name={name} />
            Fayllarni shu yerga tashlang yoki tanlang
        </div>
    );
};

export default function Read({ markdown }: { markdown: string }) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        console.log(Object.fromEntries(data.entries()));
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <ReactMarkdown
                rehypePlugins={[remarkGfm, rehypeRaw]}
                components={{
                    radio: ({ node, ...props }) => <Radio name={""} value={""} {...props} />,
                    checkbox: ({ node, ...props }) => <Checkbox name={""} value={""} children={undefined} {...props} />,
                    checkboxgroup: ({ node, ...props }) => <CheckboxGroup name={""} children={undefined} {...props} />,
                    input: ({ node, ...props }) => <input {...props} className="border p-1" />

                }}
                
            >
                {markdown}
            </ReactMarkdown>

            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Yuborish
            </button>
        </form>
    );
}