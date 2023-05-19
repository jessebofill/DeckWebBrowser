import { llog } from "../log"

export type structureMappingFn = (children: any[] | null, value: any, lineageArray: string[], ...externalArgs: any) => any

export class StructureController {
    dataStructure: {}
    constructor(dataStructure: Object) {
        this.dataStructure = dataStructure
    }
    clone() {
        return StructureController.clone(this.dataStructure)
    }
    addChildMember(newMemberName: string, value: any, lineageArrayToParent: string[], isComplex: boolean) {
        StructureController.addChildMember(this.dataStructure, newMemberName, value, lineageArrayToParent, isComplex)
    }
    addPrimitiveChildMember(newMemberName: string, value: any, lineageArrayToParent: string[]) {
        StructureController.addPrimitiveChildMember(this.dataStructure, newMemberName, value, lineageArrayToParent)
    }
    addComplexChildMember(newMemberName: string, lineageArrayToParent: string[]) {
        StructureController.addComplexChildMember(this.dataStructure, newMemberName, lineageArrayToParent)
    }

    addComplexChildMemberWithValue(dataStructure: Object, newMemberName: string, value: Object, lineageArrayToParent: string[]) {
        StructureController.addComplexChildMemberWithValue(this.dataStructure, newMemberName, value, lineageArrayToParent)
    }

    traverseAndGetMember(lineageArray: string[]) {
        return StructureController.traverseAndGetMember(this.dataStructure, lineageArray)
    }
    traverseAndGetMemberParent(lineageArray: string[]) {
        return StructureController.traverseAndGetMemberParent(this.dataStructure, lineageArray)
    }
    removeMember(lineageArray: string[]) {
        StructureController.removeMember(this.dataStructure, lineageArray)
    }
    map(mappingFn: structureMappingFn, externalArgs?: any[], mapTopLevel?: boolean, lineageArray?: string[]) {
        return StructureController.map(this.dataStructure, mappingFn, externalArgs, mapTopLevel, lineageArray)
    }
    isMemberComplex(lineageArray: string[]) {
        return (typeof StructureController.isMemberComplex(this.dataStructure, lineageArray) === 'object')
    }

    doesLineageExist(lineageArray: string[]) {
        return StructureController.doesLineageExist(this.dataStructure, lineageArray)
    }
    mergeMembersWith(
        sourceDataStructure: Object,
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        cloneSource?: boolean) {
        StructureController.mergeMembers(
            this.dataStructure,
            sourceDataStructure,
            complexTargetCollisonWithPrimitiveSourcePriority,
            primitiveTargetCollisonWithComplexSourcePriority,
            primitiveTargetCollisonWithPrimitiveSourcePriority,
            cloneSource)
    }
    mergeSourceToDescendant(
        sourceDataStructure: Object,
        targetMemberLineageArray: string[],
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target'
    ) {
        StructureController.mergeSourceToTargetDescendant(
            this.dataStructure,
            sourceDataStructure,
            targetMemberLineageArray,
            complexTargetCollisonWithPrimitiveSourcePriority,
            primitiveTargetCollisonWithComplexSourcePriority,
            primitiveTargetCollisonWithPrimitiveSourcePriority)
    }
    mergeWithSourceDescendant(
        sourceDataStructure: Object,
        sourceMemberLineageArray: string[],
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target'
    ) {
        StructureController.mergeSourceDescendantToTarget(
            this.dataStructure,
            sourceDataStructure,
            sourceMemberLineageArray,
            complexTargetCollisonWithPrimitiveSourcePriority,
            primitiveTargetCollisonWithComplexSourcePriority,
            primitiveTargetCollisonWithPrimitiveSourcePriority)
    }
    mergeSourceDescendantToDescendant(
        sourceDataStructure: Object,
        targetMemberLineageArray: string[],
        sourceMemberLineageArray: string[],
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target'
    ) {
        StructureController.mergeSourceDescendantToTargetDescendant(
            this.dataStructure,
            sourceDataStructure,
            targetMemberLineageArray,
            sourceMemberLineageArray,
            complexTargetCollisonWithPrimitiveSourcePriority,
            primitiveTargetCollisonWithComplexSourcePriority,
            primitiveTargetCollisonWithPrimitiveSourcePriority)
    }

    static lineageArrayToString(lineageArray: string[], separator: string, removeTrailingSeparator?: boolean) {
        let output = ''
        for (let i = 0; i < lineageArray.length; i++) {
            output += lineageArray[i]
            if (!(i === lineageArray.length - 1 && removeTrailingSeparator)) {
                output += separator
            }
        }
        return output
    }

    static addChildMember(dataStructure: Object, newMemberName: string, value: any, lineageArrayToParent: string[], isComplex: boolean) {
        if (!isComplex && typeof value === 'object') {
            throw new Error('Cannot assign a Complex value to a Primitive member. Value should not be an Object or Array.')
        }
        if (isComplex && typeof value !== 'object') {
            throw new Error('Cannot assign a Primitive value to a Complex member. Value should be an Object or Array.')
        }
        const parent = StructureController.traverseAndGetMember(dataStructure, lineageArrayToParent)
        if (typeof parent !== 'object') {
            throw new Error(`Cannot add member to location. Destination is a Primitive member and cannot have children.`)
        }
        parent[newMemberName] = value
    }

    static addPrimitiveChildMember(dataStructure: Object, newMemberName: string, value: any, lineageArrayToParent: string[]) {
        StructureController.addChildMember(dataStructure, newMemberName, value, lineageArrayToParent, false)
    }

    static addComplexChildMember(dataStructure: Object, newMemberName: string, lineageArrayToParent: string[]) {
        StructureController.addChildMember(dataStructure, newMemberName, {}, lineageArrayToParent, true)
    }
    static addComplexChildMemberWithValue(dataStructure: Object, newMemberName: string, value: Object, lineageArrayToParent: string[]) {
        StructureController.addChildMember(dataStructure, newMemberName, value, lineageArrayToParent, true)
    }

    static traverseAndGetMember(dataStructure: Object, lineageArray: string[]) {
        let parent = dataStructure
        llog('parent', parent)
        let traversed = ['origin']
        for (let memberName of lineageArray) {
            if (!parent.hasOwnProperty(memberName)) {
                throw new Error(`Cannot find member ${memberName} at location ${StructureController.lineageArrayToString(traversed, '> ', true)}`)
            }
            parent = parent[memberName]
            traversed.push(memberName)
        }
        llog('array ', lineageArray)
        return parent
    }

    static traverseAndGetMemberParent(dataStructure: Object, lineageArray: string[]) {
        return StructureController.traverseAndGetMember(dataStructure, lineageArray.slice(0, -1))
    }

    static removeMember(dataStructure: Object, lineageArray: string[]) {
        if (lineageArray.length < 1) {
            throw new Error('Cannot delete top level of structure.')
        }
        const memberToDelete = lineageArray[lineageArray.length - 1]
        const parent = StructureController.traverseAndGetMemberParent(dataStructure, lineageArray)
        delete parent[memberToDelete]
    }

    static map(fullStructure: Object, mappingFn: structureMappingFn, externalArgs: any[] = [], onlyMapDescendants?: boolean, lineageArray?: string[]) {
        if (externalArgs && !Array.isArray(externalArgs)) {
            throw new Error('External args must be and Array in order to pass arguments to mapping function.')
        }
        const children: any[] = []
        if (!lineageArray) lineageArray = []
        const subStructure = StructureController.traverseAndGetMember(fullStructure, lineageArray)

        for (let memberName in subStructure) {
            const member = subStructure[memberName]
            let mappedChild: any
            if (typeof member === 'object') {
                mappedChild = mappingFn(StructureController.map(fullStructure, mappingFn, externalArgs, true, [...lineageArray, memberName]), member, ['origin', ...lineageArray, memberName], ...externalArgs)
            } else {
                mappedChild = mappingFn(null, member, ['origin', ...lineageArray, memberName], ...externalArgs)
            }
            if (mappedChild) children.push(mappedChild)
        }
        if (!onlyMapDescendants) return mappingFn(children, subStructure, ['origin', ...lineageArray], ...externalArgs)
        return children
    }

    static isMemberComplex(dataStructure: Object, lineageArray: string[]) {
        return (typeof StructureController.traverseAndGetMember(dataStructure, lineageArray) === 'object')
    }

    static doesLineageExist(dataStructure: Object, lineageArray: string[]) {
        let parent = dataStructure
        for (let memberName of lineageArray) {
            if (!parent.hasOwnProperty(memberName)) {
                return false
            }
        }
        return true
    }

    static mergeMembers(
        targetDataStructure: Object,
        sourceDataStructure: Object,
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        cloneSource?: boolean) {
        if (typeof sourceDataStructure !== 'object') {
            throw new Error('Cannot merge. Source is not a data structure')
        }
        if (typeof sourceDataStructure !== 'object') {
            throw new Error('Cannot merge. Target is not a data structure')
        }
        if (cloneSource) {
            sourceDataStructure = structuredClone(sourceDataStructure)
        }
        for (let memberName in sourceDataStructure) {
            if (targetDataStructure.hasOwnProperty(memberName)) {
                if (typeof targetDataStructure[memberName] === 'object') {
                    if (typeof sourceDataStructure[memberName] === 'object') {
                        StructureController.mergeMembers(
                            targetDataStructure[memberName],
                            sourceDataStructure[memberName],
                            complexTargetCollisonWithPrimitiveSourcePriority,
                            primitiveTargetCollisonWithComplexSourcePriority,
                            primitiveTargetCollisonWithPrimitiveSourcePriority
                        )
                    } else {
                        if (complexTargetCollisonWithPrimitiveSourcePriority === 'source') {
                            targetDataStructure[memberName] = sourceDataStructure[memberName]
                        }
                    }
                } else {
                    if (typeof sourceDataStructure[memberName] === 'object') {
                        if (primitiveTargetCollisonWithComplexSourcePriority === 'source') {
                            targetDataStructure[memberName] = sourceDataStructure[memberName]
                        }
                    } else {
                        if (primitiveTargetCollisonWithPrimitiveSourcePriority === 'source') {
                            targetDataStructure[memberName] = sourceDataStructure[memberName]
                        }
                    }
                }
            } else {
                targetDataStructure[memberName] = sourceDataStructure[memberName]
            }
        }
    }

    static mergeSourceToTargetDescendant(
        targetDataStructure: Object,
        sourceDataStructure: Object,
        targetMemberLineageArray: string[],
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target'
    ) {
        const targetMember = StructureController.traverseAndGetMember(targetDataStructure, targetMemberLineageArray)
        StructureController.mergeMembers(
            targetMember,
            sourceDataStructure,
            complexTargetCollisonWithPrimitiveSourcePriority,
            primitiveTargetCollisonWithComplexSourcePriority,
            primitiveTargetCollisonWithPrimitiveSourcePriority,
            true)
    }
    static mergeSourceDescendantToTarget(
        targetDataStructure: Object,
        sourceDataStructure: Object,
        sourceMemberLineageArray: string[],
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target'
    ) {
        const sourceMember = StructureController.traverseAndGetMember(sourceDataStructure, sourceMemberLineageArray)
        StructureController.mergeMembers(
            targetDataStructure,
            sourceMember,
            complexTargetCollisonWithPrimitiveSourcePriority,
            primitiveTargetCollisonWithComplexSourcePriority,
            primitiveTargetCollisonWithPrimitiveSourcePriority,
            true)
    }
    static mergeSourceDescendantToTargetDescendant(
        targetDataStructure: Object,
        sourceDataStructure: Object,
        targetMemberLineageArray: string[],
        sourceMemberLineageArray: string[],
        complexTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithComplexSourcePriority: 'target' | 'source' = 'target',
        primitiveTargetCollisonWithPrimitiveSourcePriority: 'target' | 'source' = 'target'
    ) {
        const targetMember = StructureController.traverseAndGetMember(targetDataStructure, targetMemberLineageArray)
        const sourceMember = StructureController.traverseAndGetMember(sourceDataStructure, sourceMemberLineageArray)
        StructureController.mergeMembers(
            targetMember,
            sourceMember,
            complexTargetCollisonWithPrimitiveSourcePriority,
            primitiveTargetCollisonWithComplexSourcePriority,
            primitiveTargetCollisonWithPrimitiveSourcePriority,
            true)
    }

    static clone(dataStructure: Object) {
        if (typeof dataStructure !== 'object') {
            throw new Error('No Data structure to clone')
        }
        return structuredClone(dataStructure)
    }
}
