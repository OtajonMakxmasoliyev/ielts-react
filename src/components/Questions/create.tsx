import React, { useState, useEffect, } from "react";
import axios from "axios";
import { marked } from "marked";

export interface QuestionPayload {
  title: string;
  slug?: string;
  type: "multiple_choice" | "essay" | "fill_blank" | "listening" | "speaking" | "matching";
  bodyMarkdown: string;
  choices?: string[];
  metadata?: Record<string, any>;
  attachments?: { url: string; type: string }[];
  createdBy?: string;
  tags?: string[];
  published: boolean;
}

interface QuestionCreatorProps {
  apiUrl?: string;
}

export default function QuestionCreator({ apiUrl = "http://localhost:3000/questions/create" }: QuestionCreatorProps) {
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [type, setType] = useState<QuestionPayload["type"]>("multiple_choice");
  const [bodyMarkdown, setBodyMarkdown] = useState<string>("");
  const [choices, setChoices] = useState<string[]>(["", ""]);
  const [metadataText, setMetadataText] = useState<string>(`{\n  "timeLimit": 60,\n  "difficulty": "medium"\n}`);
  const [attachments, setAttachments] = useState<{ url: string; type: string }[]>([]);
  const [createdBy, setCreatedBy] = useState<string>("");
  const [tagsText, setTagsText] = useState<string>("");
  const [published, setPublished] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const s = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(s);
  }, [title]);

  function updateChoice(index: number, value: string) {
    setChoices((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  function addChoice() {
    setChoices((prev) => [...prev, ""]);
  }

  function removeChoice(index: number) {
    setChoices((prev) => prev.filter((_, i) => i !== index));
  }

  function addAttachment() {
    setAttachments((prev) => [...prev, { url: "", type: "image" }]);
  }

  function updateAttachment(index: number, key: "url" | "type", value: string) {
    setAttachments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const e: string[] = [];
    if (!title.trim()) e.push("Title is required");
    if (!bodyMarkdown.trim()) e.push("Body (markdown) is required");
    if (
      !["multiple_choice", "essay", "fill_blank", "listening", "speaking", "matching"].includes(
        type
      )
    )
      e.push("Invalid type");
    if (type === "multiple_choice" && choices.filter((c) => c.trim()).length < 2)
      e.push("Multiple choice must have at least 2 non-empty choices");
    try {
      JSON.parse(metadataText);
    } catch (err) {
      e.push("Metadata must be valid JSON");
    }
    setErrors(e);
    return e.length === 0;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setResult(null);
    if (!validate()) return;
    setSaving(true);
    const payload: QuestionPayload = {
      title: title.trim(),
      slug: slug || undefined,
      type,
      bodyMarkdown,
      choices: type === "multiple_choice" ? choices.filter((c) => c.trim()) : undefined,
      metadata: JSON.parse(metadataText),
      attachments: attachments.filter((a) => a.url.trim()).map((a) => ({ url: a.url.trim(), type: a.type })),
      createdBy: createdBy || undefined,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      published,
    };
    console.log(bodyMarkdown);

    try {
      const res = await axios.post(apiUrl, payload);
      setResult({ ok: true, data: res.data });
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data || err.message || String(err);
      setResult({ ok: false, error: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className=" p-6">
      <h1 className="text-2xl font-bold mb-4">Create Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow w-full">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter question title"
          />
          <p className="text-xs text-gray-500 mt-1">
            Slug: <span className="font-mono">{slug}</span>
          </p>
        </div>

        {/* Type and CreatedBy */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionPayload["type"])}
              className="w-full border rounded p-2"
            >
              <option value="multiple_choice">multiple_choice</option>
              <option value="essay">essay</option>
              <option value="fill_blank">fill_blank</option>
              <option value="listening">listening</option>
              <option value="speaking">speaking</option>
              <option value="matching">matching</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Created By (user id)</label>
            <input
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="ObjectId or user id string"
            />
          </div>
        </div>

        {/* Body Markdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Body (Markdown)</label>
          <textarea
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            rows={8}
            className="w-full border rounded p-2 font-mono"
            placeholder="# Question text in markdown"
          />
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Preview</label>
            <div
              className="prose max-w-full border rounded p-3"
              dangerouslySetInnerHTML={{ __html: marked(bodyMarkdown || "") }}
            />
          </div>
        </div>

        {/* Multiple choice */}
        {type === "multiple_choice" && (
          <div>
            <label className="block text-sm font-medium mb-2">Choices</label>
            <div className="space-y-2">
              {choices.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-6 text-sm">{String.fromCharCode(65 + i)}.</span>
                  <input
                    value={c}
                    onChange={(e) => updateChoice(i, e.target.value)}
                    className="flex-1 border rounded p-2"
                  />
                  <button
                    type="button"
                    className="px-3 py-1 text-sm border rounded"
                    onClick={() => removeChoice(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <button type="button" onClick={addChoice} className="px-3 py-1 border rounded">
                  Add choice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div>
          <label className="block text-sm font-medium mb-2">Metadata (JSON)</label>
          <textarea
            value={metadataText}
            onChange={(e) => setMetadataText(e.target.value)}
            rows={4}
            className="w-full border rounded p-2 font-mono"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium mb-2">Attachments</label>
          <div className="space-y-2">
            {attachments.map((a, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="col-span-7 border rounded p-2"
                  placeholder="https://..."
                  value={a.url}
                  onChange={(e) => updateAttachment(i, "url", e.target.value)}
                />
                <select
                  className="col-span-3 border rounded p-2"
                  value={a.type}
                  onChange={(e) => updateAttachment(i, "type", e.target.value)}
                >
                  <option value="image">image</option>
                  <option value="audio">audio</option>
                  <option value="other">other</option>
                </select>
                <div className="col-span-2">
                  <button
                    type="button"
                    className="px-3 py-1 border rounded"
                    onClick={() => removeAttachment(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button type="button" onClick={addAttachment} className="px-3 py-1 border rounded">
                Add attachment
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="grammar, vocabulary, band7"
          />
        </div>

        {/* Published */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>Published</span>
          </label>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-3 rounded">
            <ul className="text-sm text-red-700">
              {errors.map((er, i) => (
                <li key={i}>{er}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white"
            type="submit"
          >
            {saving ? "Saving..." : "Save Question"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle("Sample: Past Simple Questions");
              setType("multiple_choice");
              setBodyMarkdown("**Choose the correct form:**\\n\\n1. I (go) to the shop yesterday.");
              setChoices(["went", "go", "gone"]);
              setMetadataText(JSON.stringify({ timeLimit: 60, difficulty: "easy" }, null, 2));
              setTagsText("grammar,verb tenses");
            }}
            className="px-3 py-2 border rounded"
          >
            Fill example
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`p-3 rounded ${result.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
          >
            {result.ok ? (
              <div>
                <strong>Saved!</strong>
                <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            ) : (
              <div>
                <strong>Error:</strong>
                <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(result.error, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p>Notes:</p>
        <ul className="list-disc ml-5">
          <li>
            The component posts JSON to <code className="font-mono">{apiUrl}</code>. Implement a server route that
            accepts this payload and uses your Mongoose model to save it.
          </li>
          <li>
            {/* If you prefer fetch: replace axios.post with fetch(apiUrl, {{ 'method': 'POST', headers: {{'Content-Type':'application/json' }}, body: JSON.stringify(payload) }}) */}
          </li>
          <li>Metadata is free-form JSON. The form validates JSON before submission.</li>
        </ul>
      </div>
    </div>
  );
}