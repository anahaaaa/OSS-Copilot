def create_issue_text(issue) -> str:
    return f"""
Title: {issue.title}
Body: {issue.body or ''}
label: {','.join(issue.labels or [])}
"""