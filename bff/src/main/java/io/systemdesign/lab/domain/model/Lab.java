package io.systemdesign.lab.domain.model;

import java.util.List;

/**
 * A hands-on System Design lab: an interview-style prompt plus the scaffold to practice it
 * (requirements, estimations, deep-dives, trade-offs and a self-check rubric). Practice, not just
 * reading — the reference approach is meant to be revealed only after the candidate has attempted it.
 */
public record Lab(
        String id,
        String title,
        String summary,
        String companies,
        String difficulty,
        String prompt,
        List<String> functionalRequirements,
        List<String> nonFunctionalRequirements,
        List<String> clarifyingQuestions,
        List<String> estimations,
        List<String> apiSketch,
        List<String> dataNotes,
        List<String> deepDives,
        List<String> rubric,
        List<String> commonFollowUps,
        List<TradeOff> tradeOffs,
        String referenceApproach,
        List<String> relatedPatterns,
        List<SourceRef> sourceRefs) {

    public Lab {
        functionalRequirements = copy(functionalRequirements);
        nonFunctionalRequirements = copy(nonFunctionalRequirements);
        clarifyingQuestions = copy(clarifyingQuestions);
        estimations = copy(estimations);
        apiSketch = copy(apiSketch);
        dataNotes = copy(dataNotes);
        deepDives = copy(deepDives);
        rubric = copy(rubric);
        commonFollowUps = copy(commonFollowUps);
        tradeOffs = copy(tradeOffs);
        relatedPatterns = copy(relatedPatterns);
        sourceRefs = copy(sourceRefs);
    }

    private static <T> List<T> copy(List<T> in) {
        return in == null ? List.of() : List.copyOf(in);
    }
}
