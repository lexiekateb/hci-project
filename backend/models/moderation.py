from pydantic import BaseModel


class Moderation(BaseModel):
    flagged: bool = False
    sexual: bool = False
    sexual_minors: bool = False
    harassment: bool = False
    harassment_threatening: bool = False
    hate: bool = False
    hate_threatening: bool = False
    illicit: bool = False
    illicit_violent: bool = False
    self_harm: bool = False
    self_harm_intent: bool = False
    self_harm_instructions: bool = False
    violence: bool = False
    violence_graphic: bool = False
