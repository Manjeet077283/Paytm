import { z, ZodSchema } from 'zod';
import { Permission, RiskLevel } from '../types';

export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  inputSchema: ZodSchema<TInput>;
  requiredPermissions: Permission[];
  riskLevel: RiskLevel;
  execute: (params: TInput, context: ToolExecutionContext) => Promise<TOutput>;
}

export interface ToolExecutionContext {
  taskId: string;
  callerPermissions: Permission[];
  datasetPath?: string;
  state: Record<string, any>;
}

export class ToolRouter {
  private tools = new Map<string, ToolDefinition>();

  public registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public listTools(): Array<Omit<ToolDefinition, 'execute' | 'inputSchema'> & { inputSchemaDesc: string }> {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      requiredPermissions: t.requiredPermissions,
      riskLevel: t.riskLevel,
      inputSchemaDesc: t.inputSchema.description || 'Zod Object Schema'
    }));
  }

  public async executeTool(
    toolName: string,
    params: any,
    context: ToolExecutionContext
  ): Promise<{ success: boolean; data?: any; error?: string; durationMs: number }> {
    const startTime = Date.now();
    const tool = this.tools.get(toolName);

    if (!tool) {
      return {
        success: false,
        error: `Tool "${toolName}" is not registered in Tool Router.`,
        durationMs: Date.now() - startTime
      };
    }

    // 1. Permission Check
    const hasAllPermissions = tool.requiredPermissions.every((perm) =>
      context.callerPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return {
        success: false,
        error: `Permission Denied: Caller lacks required permissions [${tool.requiredPermissions.join(', ')}] for tool "${toolName}".`,
        durationMs: Date.now() - startTime
      };
    }

    // 2. Input Validation via Zod
    const validation = tool.inputSchema.safeParse(params);
    if (!validation.success) {
      return {
        success: false,
        error: `Validation Error for tool "${toolName}": ${validation.error.message}`,
        durationMs: Date.now() - startTime
      };
    }

    // 3. Execution
    try {
      const output = await tool.execute(validation.data, context);
      return {
        success: true,
        data: output,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Execution Error in tool "${toolName}": ${err.message || String(err)}`,
        durationMs: Date.now() - startTime
      };
    }
  }
}

export const defaultToolRouter = new ToolRouter();
