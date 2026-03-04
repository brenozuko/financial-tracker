from dataclasses import dataclass, field
from typing import Any, Callable

from sqlalchemy.orm import Query


@dataclass(frozen=True)
class FilterSpec:
    param: str
    build: Callable[[Any], Any]
    applies: Callable[[Any], bool] = field(default=lambda v: v is not None)


def apply_filters(
    query: Query,
    specs: list[FilterSpec],
    params: dict[str, Any],
) -> Query:
    clauses = [
        spec.build(params[spec.param])
        for spec in specs
        if spec.applies(params.get(spec.param))
    ]
    return query.filter(*clauses) if clauses else query
