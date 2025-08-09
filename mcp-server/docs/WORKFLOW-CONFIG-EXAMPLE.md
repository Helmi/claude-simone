# Workflow Configuration Example

This document demonstrates how to configure the new workflow features in the `work_issue` prompt.

## Configuration Structure

Add the following to your `.simone/project.yaml` file:

```yaml
project:
  name: my-project
  
features:
  workflow:
    autoCommit: false  # Set to false to enable manual testing checkpoint
```

## Behavior

### When `autoCommit: true` (or not set - default behavior)

The prompt will:

1. Complete implementation (step 5)
2. Run quality checks
3. **Automatically proceed** to commit and create PR (step 6)
4. Switch back to the default branch after PR creation

### When `autoCommit: false`

The prompt will:

1. Complete implementation (step 5)
2. Run quality checks
3. **PAUSE** and display a checkpoint message
4. Wait for user confirmation (e.g., "proceed with commit")
5. Only then continue to commit and create PR (step 6)
6. Switch back to the default branch after PR creation

## Benefits

1. **Manual Testing**: Allows developers to manually test changes before committing
2. **Clean Branch State**: Automatically returns to the default branch after PR creation
3. **Backward Compatible**: Default behavior remains unchanged
4. **Flexible Workflow**: Can be toggled per project based on needs