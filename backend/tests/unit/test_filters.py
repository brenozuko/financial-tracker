from unittest.mock import MagicMock

from app.services.filters import FilterSpec, apply_filters


def test_skips_none_values():
    spec = FilterSpec(param="name", build=lambda v: f"name == {v}")
    query = MagicMock()

    apply_filters(query, [spec], {"name": None})

    query.filter.assert_not_called()


def test_applies_when_value_present():
    spec = FilterSpec(param="name", build=lambda v: f"name == {v}")
    query = MagicMock()
    query.filter.return_value = query

    result = apply_filters(query, [spec], {"name": "Alice"})

    query.filter.assert_called_once_with("name == Alice")
    assert result is query


def test_custom_applies_skips_empty_string():
    spec = FilterSpec(
        param="search",
        build=lambda v: f"desc ILIKE {v}",
        applies=bool,
    )
    query = MagicMock()

    apply_filters(query, [spec], {"search": ""})

    query.filter.assert_not_called()


def test_custom_applies_accepts_truthy_value():
    spec = FilterSpec(
        param="search",
        build=lambda v: f"desc ILIKE {v}",
        applies=bool,
    )
    query = MagicMock()
    query.filter.return_value = query

    result = apply_filters(query, [spec], {"search": "food"})

    query.filter.assert_called_once_with("desc ILIKE food")
    assert result is query


def test_multiple_specs_partial_match():
    specs = [
        FilterSpec(param="a", build=lambda v: f"a == {v}"),
        FilterSpec(param="b", build=lambda v: f"b == {v}"),
    ]
    query = MagicMock()
    query.filter.return_value = query

    apply_filters(query, specs, {"a": 1, "b": None})

    query.filter.assert_called_once_with("a == 1")


def test_missing_param_in_dict_is_skipped():
    spec = FilterSpec(param="missing", build=lambda v: f"x == {v}")
    query = MagicMock()

    apply_filters(query, [spec], {})

    query.filter.assert_not_called()


def test_all_specs_applied():
    specs = [
        FilterSpec(param="a", build=lambda v: f"a == {v}"),
        FilterSpec(param="b", build=lambda v: f"b == {v}"),
    ]
    query = MagicMock()
    query.filter.return_value = query

    apply_filters(query, specs, {"a": 1, "b": 2})

    query.filter.assert_called_once_with("a == 1", "b == 2")


def test_returns_original_query_when_no_filters_apply():
    spec = FilterSpec(param="x", build=lambda v: f"x == {v}")
    query = MagicMock()

    result = apply_filters(query, [spec], {"x": None})

    assert result is query
    query.filter.assert_not_called()
