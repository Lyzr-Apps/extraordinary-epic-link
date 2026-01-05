'use client'

import { useState, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  AlertCircle,
  ChevronDown,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Zap,
} from 'lucide-react'

// Types matching the Credit Calculator Manager response schema
interface ArchitectureOverview {
  agentCount: number
  agentTypes: string[]
  orchestrationPattern: string
  kbRequired: boolean
  kbEstimatedSizeMB: number
  toolsNeeded: string[]
  estimatedSessionsPerMonth: number
  apiCallsPerSession: number
  recommendedModels: string[]
  complexityScore: number
}

interface CreationCosts {
  agents: number
  sessions: number
  kb: number
  rai: number
  tools: number
}

interface RuntimeCostsPerQuery {
  kbRetrieval: number
  apiLight: number
  rai: number
  memory: number
}

interface ModelCostsPerQuery {
  inputCost: number
  outputCost: number
  model: string
}

interface CostBreakdown {
  creationCosts: CreationCosts
  runtimeCostsPerQuery: RuntimeCostsPerQuery
  modelCostsPerQuery: ModelCostsPerQuery
  monthlyTotalCost: number
  annualTotalCost: number
  costPerSession: number
  costPerQuery: number
}

interface Projections {
  estimatedMonthlyQueries: number
  estimatedAnnualQueries: number
  monthlyTotalCost: number
  annualTotalCost: number
}

interface UnifiedReport {
  architectureOverview: ArchitectureOverview
  costBreakdown: CostBreakdown
  projections: Projections
  recommendations: string[]
}

interface APIResponse {
  status: string
  unifiedReport: UnifiedReport
  metadata: {
    managerAgent: string
    timestamp: string
  }
}

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(value))
}

const AGENT_ID = '695bb57dc2dad05ba69ad552'

const SAMPLE_PROBLEM = `I need a customer support chatbot with knowledge base that can escalate to human agents and send email notifications`

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-[#4f7df3]" />
    </div>
  )
}

// Error Display Component
function ErrorMessage({ message }: { message: string }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-start gap-3 pt-6">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">Error</p>
          <p className="text-sm text-red-800 mt-1">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Architecture Panel Component
function ArchitecturePanel({
  overview,
}: {
  overview: ArchitectureOverview
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-[#e5e7eb]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 hover:bg-gray-50 rounded-t-lg">
              <div>
                <CardTitle className="text-lg">Architecture Overview</CardTitle>
                <CardDescription className="mt-2">
                  {overview.agentCount} agents • Complexity Score:{' '}
                  <span className="font-semibold text-[#333]">
                    {overview.complexityScore}/10
                  </span>
                </CardDescription>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </CardHeader>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-600">Orchestration Pattern</p>
                <p className="font-semibold text-[#1a1f36]">
                  {overview.orchestrationPattern}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-600">API Calls/Session</p>
                <p className="font-semibold text-[#1a1f36]">
                  {overview.apiCallsPerSession}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#333] mb-2">
                Agent Types
              </p>
              <div className="flex flex-wrap gap-2">
                {overview.agentTypes.map((agent, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-[#1a1f36]">
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>

            {overview.kbRequired && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm font-semibold text-amber-900">
                  Knowledge Base Required
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Estimated Size: {overview.kbEstimatedSizeMB}MB
                </p>
              </div>
            )}

            {overview.toolsNeeded.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#333] mb-2">
                  Required Tools
                </p>
                <ul className="space-y-1">
                  {overview.toolsNeeded.map((tool, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {overview.recommendedModels.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#333] mb-2">
                  Recommended Models
                </p>
                <div className="flex flex-wrap gap-2">
                  {overview.recommendedModels.map((model, idx) => (
                    <Badge key={idx} className="bg-[#4f7df3] text-white">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// Cost Breakdown Table Component
function CostBreakdownTable({ costBreakdown }: { costBreakdown: CostBreakdown }) {
  const [isOpen, setIsOpen] = useState(false)

  const creationItems = [
    {
      name: 'Agents',
      quantity: costBreakdown.creationCosts.agents,
      cost: costBreakdown.creationCosts.agents,
    },
    {
      name: 'Sessions',
      quantity: costBreakdown.creationCosts.sessions,
      cost: costBreakdown.creationCosts.sessions,
    },
    {
      name: 'Knowledge Base',
      quantity: costBreakdown.creationCosts.kb,
      cost: costBreakdown.creationCosts.kb,
    },
    {
      name: 'Tools',
      quantity: costBreakdown.creationCosts.tools,
      cost: costBreakdown.creationCosts.tools,
    },
  ]

  const runtimeItems = [
    {
      name: 'KB Retrieval (per query)',
      cost: costBreakdown.runtimeCostsPerQuery.kbRetrieval,
    },
    {
      name: 'API Light (per query)',
      cost: costBreakdown.runtimeCostsPerQuery.apiLight,
    },
    {
      name: 'Memory (per query)',
      cost: costBreakdown.runtimeCostsPerQuery.memory,
    },
  ]

  const modelItems = [
    {
      name: `Model (${costBreakdown.modelCostsPerQuery.model})`,
      cost: costBreakdown.modelCostsPerQuery.inputCost + costBreakdown.modelCostsPerQuery.outputCost,
    },
  ]

  return (
    <Card className="border-[#e5e7eb]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 hover:bg-gray-50 rounded-t-lg">
              <div>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                <CardDescription className="mt-2">
                  Monthly: <span className="font-semibold text-[#333]">
                    {formatCurrency(costBreakdown.monthlyTotalCost)}
                  </span>
                </CardDescription>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </CardHeader>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Creation Costs */}
            <div>
              <h4 className="font-semibold text-[#1a1f36] mb-3 text-sm">
                One-Time Creation Costs
              </h4>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600 text-xs">Item</TableHead>
                    <TableHead className="text-right text-gray-600 text-xs">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creationItems.map((item, idx) => (
                    <TableRow key={idx} className="border-gray-200">
                      <TableCell className="text-sm text-gray-700">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-gray-700">
                        {formatCurrency(item.cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Runtime Costs */}
            <div>
              <h4 className="font-semibold text-[#1a1f36] mb-3 text-sm">
                Runtime Costs Per Query
              </h4>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600 text-xs">Item</TableHead>
                    <TableHead className="text-right text-gray-600 text-xs">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runtimeItems.map((item, idx) => (
                    <TableRow key={idx} className="border-gray-200">
                      <TableCell className="text-sm text-gray-700">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-gray-700">
                        {formatCurrency(item.cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Model Costs */}
            <div>
              <h4 className="font-semibold text-[#1a1f36] mb-3 text-sm">
                Model Costs Per Query
              </h4>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600 text-xs">Item</TableHead>
                    <TableHead className="text-right text-gray-600 text-xs">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelItems.map((item, idx) => (
                    <TableRow key={idx} className="border-gray-200">
                      <TableCell className="text-sm text-gray-700">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-gray-700">
                        {formatCurrency(item.cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// Metric Cards Component
function MetricCards({ projections }: { projections: Projections }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-[#e5e7eb] bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Monthly Total Cost</p>
              <p className="text-3xl font-bold text-[#4f7df3] mt-2 font-mono">
                {formatCurrency(projections.monthlyTotalCost)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-[#4f7df3] opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e5e7eb] bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Annual Total Cost</p>
              <p className="text-3xl font-bold text-[#10b981] mt-2 font-mono">
                {formatCurrency(projections.annualTotalCost)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-[#10b981] opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e5e7eb] bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Estimated Monthly Queries</p>
              <p className="text-3xl font-bold text-purple-600 mt-2 font-mono">
                {formatNumber(projections.estimatedMonthlyQueries)}
              </p>
            </div>
            <Zap className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e5e7eb] bg-gradient-to-br from-orange-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Annual Total Queries</p>
              <p className="text-3xl font-bold text-orange-600 mt-2 font-mono">
                {formatNumber(projections.estimatedAnnualQueries)}
              </p>
            </div>
            <Zap className="h-10 w-10 text-orange-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Recommendations Component
function RecommendationsPanel({
  recommendations,
}: {
  recommendations: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-[#e5e7eb]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 hover:bg-gray-50 rounded-t-lg">
              <div>
                <CardTitle className="text-lg">Recommendations</CardTitle>
                <CardDescription className="mt-2">
                  {recommendations.length} optimization tips
                </CardDescription>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </CardHeader>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#4f7df3] text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-700 pt-0.5">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// Main Calculator Component
export default function CreditCalculator() {
  const [problemStatement, setProblemStatement] = useState('')
  const [monthlySessions, setMonthlySessions] = useState(1000)
  const [queriesPerSession, setQueriesPerSession] = useState(5)
  const [modelTier, setModelTier] = useState('GPT-5')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<APIResponse | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleCalculate = async () => {
    setError('')

    if (!problemStatement.trim()) {
      setError('Please enter a problem statement')
      return
    }

    setLoading(true)

    try {
      const requestData = {
        agent_id: AGENT_ID,
        message: JSON.stringify({
          problemStatement,
          monthlySessions,
          queriesPerSession,
          modelTier,
        }),
      }

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      const data = await res.json()

      if (data.success) {
        const agentResponse = data.response
        if (
          agentResponse &&
          typeof agentResponse === 'object' &&
          agentResponse.unifiedReport
        ) {
          setResponse(agentResponse)
          // Scroll to results
          setTimeout(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        } else {
          setError(
            'Invalid response format from agent. Please try again.'
          )
        }
      } else {
        setError(data.error || 'Failed to calculate credits')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSample = () => {
    setProblemStatement(SAMPLE_PROBLEM)
  }

  const handleExportPDF = () => {
    if (!response) return

    // Create a simple text-based PDF export
    const report = generatePDFContent(response)
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(report)
    )
    element.setAttribute(
      'download',
      `credit-calculation-${new Date().toISOString().split('T')[0]}.txt`
    )
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopySummary = () => {
    if (!response) return

    const summary = generateSummary(response)
    navigator.clipboard.writeText(summary)
  }

  const handleRecalculate = () => {
    setResponse(null)
    setProblemStatement('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#e5e7eb] bg-gradient-to-r from-[#1a1f36] to-[#2d3548]">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">
            Lyzr Credit Calculator
          </h1>
          <p className="text-blue-200 mt-2">
            Estimate your agent architecture costs
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Input Section */}
        {!response ? (
          <div className="space-y-6">
            {error && <ErrorMessage message={error} />}

            {/* Problem Statement Card */}
            <Card className="border-[#e5e7eb]">
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
                <CardDescription>
                  Describe your use case or requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problem">Your Problem Statement</Label>
                  <Textarea
                    id="problem"
                    placeholder="e.g., I need a customer support chatbot with knowledge base that can escalate to human agents..."
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    rows={6}
                    className="border-[#e5e7eb] focus:ring-[#4f7df3] focus:border-[#4f7df3]"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {problemStatement.length} characters
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadSample}
                      className="border-[#e5e7eb]"
                    >
                      Load Sample
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parameters Card */}
            <Card className="border-[#e5e7eb]">
              <CardHeader>
                <CardTitle>Estimation Parameters</CardTitle>
                <CardDescription>
                  Provide your usage expectations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessions">Monthly Sessions</Label>
                    <Input
                      id="sessions"
                      type="number"
                      min="100"
                      max="1000000"
                      value={monthlySessions}
                      onChange={(e) =>
                        setMonthlySessions(
                          Math.max(100, parseInt(e.target.value) || 100)
                        )
                      }
                      className="border-[#e5e7eb] focus:ring-[#4f7df3] focus:border-[#4f7df3]"
                    />
                    <p className="text-xs text-gray-500">
                      Min: 100 • Max: 1,000,000
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="queries">Queries Per Session</Label>
                    <Input
                      id="queries"
                      type="number"
                      min="1"
                      max="50"
                      value={queriesPerSession}
                      onChange={(e) =>
                        setQueriesPerSession(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="border-[#e5e7eb] focus:ring-[#4f7df3] focus:border-[#4f7df3]"
                    />
                    <p className="text-xs text-gray-500">
                      Min: 1 • Max: 50
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model Tier</Label>
                    <Select value={modelTier} onValueChange={setModelTier}>
                      <SelectTrigger
                        id="model"
                        className="border-[#e5e7eb] focus:ring-[#4f7df3] focus:border-[#4f7df3]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GPT-5">GPT-5</SelectItem>
                        <SelectItem value="GPT-5 Mini">GPT-5 Mini</SelectItem>
                        <SelectItem value="GPT-5 Nano">GPT-5 Nano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleCalculate}
                disabled={loading}
                size="lg"
                className="bg-[#4f7df3] hover:bg-[#3d5ebf] text-white px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  'Calculate Credits'
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-6" ref={contentRef}>
            {/* Results Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1f36]">
                  Cost Estimation Results
                </h2>
                <p className="text-gray-600 mt-1">
                  Generated on{' '}
                  {new Date(response.metadata.timestamp).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                className="border-[#e5e7eb] text-[#4f7df3]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
            </div>

            {/* Architecture Panel */}
            <ArchitecturePanel
              overview={response.unifiedReport.architectureOverview}
            />

            {/* Cost Breakdown */}
            <CostBreakdownTable
              costBreakdown={response.unifiedReport.costBreakdown}
            />

            {/* Metric Cards */}
            <MetricCards projections={response.unifiedReport.projections} />

            {/* Recommendations */}
            <RecommendationsPanel
              recommendations={response.unifiedReport.recommendations}
            />

            {/* Action Buttons */}
            <Card className="border-[#e5e7eb] bg-blue-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={handleExportPDF}
                    variant="outline"
                    className="border-[#4f7df3] text-[#4f7df3] hover:bg-[#4f7df3] hover:text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Summary
                  </Button>
                  <Button
                    onClick={handleCopySummary}
                    variant="outline"
                    className="border-[#4f7df3] text-[#4f7df3] hover:bg-[#4f7df3] hover:text-white"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                  <Button
                    onClick={handleRecalculate}
                    className="bg-[#4f7df3] hover:bg-[#3d5ebf] text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Calculation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 text-center">
            Lyzr Credit Calculator • Powered by AI Agent Architecture Analysis
          </p>
        </div>
      </footer>
    </div>
  )
}

// Helper functions for PDF/summary export
function generateSummary(response: APIResponse): string {
  const { unifiedReport } = response
  const { architectureOverview, costBreakdown, projections } = unifiedReport

  const lines = [
    'LYZR CREDIT CALCULATOR - COST ESTIMATION SUMMARY',
    '='.repeat(50),
    '',
    'ARCHITECTURE OVERVIEW',
    '-'.repeat(30),
    `Agents: ${architectureOverview.agentCount}`,
    `Agent Types: ${architectureOverview.agentTypes.join(', ')}`,
    `Orchestration: ${architectureOverview.orchestrationPattern}`,
    `Complexity Score: ${architectureOverview.complexityScore}/10`,
    `Knowledge Base Required: ${architectureOverview.kbRequired ? 'Yes' : 'No'}`,
    architectureOverview.kbRequired
      ? `KB Size: ${architectureOverview.kbEstimatedSizeMB}MB`
      : '',
    `API Calls per Session: ${architectureOverview.apiCallsPerSession}`,
    `Recommended Model: ${architectureOverview.recommendedModels.join(', ')}`,
    '',
    'COST BREAKDOWN',
    '-'.repeat(30),
    `Monthly Total: ${formatCurrency(costBreakdown.monthlyTotalCost)}`,
    `Annual Total: ${formatCurrency(costBreakdown.annualTotalCost)}`,
    `Cost per Session: ${formatCurrency(costBreakdown.costPerSession)}`,
    `Cost per Query: ${formatCurrency(costBreakdown.costPerQuery)}`,
    '',
    'PROJECTIONS',
    '-'.repeat(30),
    `Monthly Queries: ${formatNumber(projections.estimatedMonthlyQueries)}`,
    `Annual Queries: ${formatNumber(projections.estimatedAnnualQueries)}`,
    '',
    'RECOMMENDATIONS',
    '-'.repeat(30),
    ...unifiedReport.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`),
    '',
    `Generated: ${new Date(response.metadata.timestamp).toISOString()}`,
  ]

  return lines.filter(Boolean).join('\n')
}

function generatePDFContent(response: APIResponse): string {
  return generateSummary(response)
}
