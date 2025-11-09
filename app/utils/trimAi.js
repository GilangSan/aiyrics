export function formatAiTextToJsx(text) {
  if (!text) return null;
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs.map((p, idx) => (
    <p key={idx} className="leading-relaxed mb-3 whitespace-pre-wrap">
      {p.split("\n").map((line, i) => (
        <span key={i}>
          {line}
          {i < p.split("\n").length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
}