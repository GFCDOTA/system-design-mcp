package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.GlossaryEntry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** AI &amp; Agents glossary — a separate learning track from the System Design content. */
@RestController
@RequestMapping("/api/ai-glossary")
public class AiGlossaryController {

    private final KnowledgeService service;

    public AiGlossaryController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<GlossaryEntry> list() {
        return service.listAiGlossary();
    }
}
