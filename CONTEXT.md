# Antzoo

Antzoo is a reproducible living terrarium in which two ant colonies, the world around them, and the god's interventions create histories worth watching.

## Language

**World**:
The seed-defined terrarium whose colonies, creatures, resources, weather, and interventions produce one reproducible history. Its state determines what can happen next.

**Presentation**:
The visible and audible expression of the World, including transient effects and camera response. Presentation can reveal or dramatize World facts but never changes what the World does next.
_Avoid_: Renderer, effects

**Presentation decision**:
A reproducible choice about how a World fact is expressed, such as effect placement, variation, or intensity. It is stable for the same World history but independent of gameplay randomness and display interpolation.
_Avoid_: Gameplay event

**Presentation cue**:
A fact that something happened in the World and may need a one-time visible or audible reaction, such as a delivery, death, intervention, or season change. It describes what happened, not how Presentation should depict it.
_Avoid_: Effect command, debug event
