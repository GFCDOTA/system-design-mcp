package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.Lab;
import io.systemdesign.lab.infrastructure.web.dto.SummaryDtos.LabSummary;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Hands-on System Design labs: list returns lightweight summaries, detail returns the full Lab. */
@RestController
@RequestMapping("/api/labs")
@Validated
public class LabController {

    private final KnowledgeService service;

    public LabController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<LabSummary> list() {
        return service.listLabs().stream().map(LabSummary::from).toList();
    }

    @GetMapping("/{id}")
    public Lab get(@PathVariable @Pattern(regexp = TopicController.ID_PATTERN) String id) {
        return service.getLab(id);
    }
}
