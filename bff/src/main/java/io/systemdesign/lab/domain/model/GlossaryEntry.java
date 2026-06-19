package io.systemdesign.lab.domain.model;

import java.util.List;

/**
 * An entry of the AI &amp; Agents glossary — a separate track from the System Design content,
 * sourced to AI references (Anthropic, MCP spec) rather than the workbook.
 *
 * @param framing optional framing tag (e.g. "MOTOR", "CASCA / runtime"), nullable
 * @param kind    "term" or "comparison" (comparison entries use {@code pitfall} as the contrast)
 */
public record GlossaryEntry(
        String id,
        String term,
        String framing,
        String kind,
        String definition,
        String backendAnalogy,
        String pitfall,
        List<SourceRef> sourceRefs) {

    public GlossaryEntry {
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }
}
